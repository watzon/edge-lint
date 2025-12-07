/**
 * Rule: no-assign-without-let
 *
 * Warns when @assign is used on a variable not defined with @let.
 *
 * Bad: @assign(count = 10)  -- count was never defined
 * Good: @let(count = 0) ... @assign(count = count + 1)
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';
import type { Token } from 'edge-lexer/types';

// Extract variable name from @let or @assign expression
// @let(varName = value) or @assign(varName = value)
function extractVariableName(jsArg: string): string | null {
  const trimmed = jsArg.trim();
  const match = trimmed.match(/^(\w+)\s*=/);
  return match?.[1] ?? null;
}

export const noAssignWithoutLet: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow @assign for variables not defined with @let',
      category: 'Best Practices',
      recommended: true,
      url: 'https://edgejs.dev/docs/templates_state#inline-variables',
    },
    messages: {
      undefinedVariable: 'Variable "{{ name }}" is assigned but never defined with @let.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    // Track defined variables and their scope
    const definedVariables = new Set<string>();
    const assignTokens: Array<{ token: TagToken; varName: string }> = [];

    // Recursively collect all @let definitions from tokens
    function collectLetDefinitions(tokens: Token[]): void {
      for (const token of tokens) {
        if (token.type === 'tag') {
          const tag = token as unknown as TagToken;
          if (tag.properties.name === 'let') {
            const varName = extractVariableName(tag.properties.jsArg);
            if (varName) {
              definedVariables.add(varName);
            }
          }
          // Recurse into children
          if (tag.children) {
            collectLetDefinitions(tag.children);
          }
        }
      }
    }

    return {
      // Collect @let definitions
      Tag(token: TagToken) {
        if (token.properties.name === 'let') {
          const varName = extractVariableName(token.properties.jsArg);
          if (varName) {
            definedVariables.add(varName);
          }
        } else if (token.properties.name === 'assign') {
          const varName = extractVariableName(token.properties.jsArg);
          if (varName) {
            assignTokens.push({ token, varName });
          }
        }
      },

      // Check all @assign at the end
      'Program:exit'(tokens: Token[]) {
        // Also collect from nested tokens (in case visitor missed some)
        collectLetDefinitions(tokens);

        // Report any @assign for undefined variables
        for (const { token, varName } of assignTokens) {
          if (!definedVariables.has(varName)) {
            context.report({
              node: token,
              messageId: 'undefinedVariable',
              data: { name: varName },
            });
          }
        }
      },
    };
  },
};
