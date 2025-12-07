/**
 * Rule: no-unused-let
 *
 * Warns when a variable defined with @let is never used.
 */

import type { Rule, TagToken, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';
import type { Token } from 'edge-lexer/types';

interface VariableInfo {
  name: string;
  token: TagToken;
  used: boolean;
}

// Extract variable name from @let expression
// @let(varName = expression) or @let(varName)
function extractLetVariableName(jsArg: string): string | null {
  const trimmed = jsArg.trim();

  // Match: varName = ... or just varName
  const match = trimmed.match(/^(\w+)\s*(?:=|$)/);
  return match?.[1] ?? null;
}

// Check if an expression references a variable
function expressionReferencesVariable(expr: string, varName: string): boolean {
  // Simple check: look for the variable name as a word boundary
  // This is a basic approach - a proper implementation would parse the AST
  const regex = new RegExp(`\\b${varName}\\b`);
  return regex.test(expr);
}

export const noUnusedLet: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when a @let variable is never used',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      unused: 'Variable "{{ name }}" is defined but never used.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const variables: VariableInfo[] = [];

    function checkUsageInExpression(expr: string): void {
      for (const varInfo of variables) {
        if (expressionReferencesVariable(expr, varInfo.name)) {
          varInfo.used = true;
        }
      }
    }

    function checkUsageInTokens(tokens: Token[]): void {
      for (const token of tokens) {
        if (token.type === 'mustache' || token.type === 's__mustache') {
          const mustache = token as unknown as MustacheToken;
          checkUsageInExpression(mustache.properties.jsArg);
        } else if (token.type === 'tag') {
          const tag = token as unknown as TagToken;
          if (tag.properties.jsArg) {
            checkUsageInExpression(tag.properties.jsArg);
          }
          if (tag.children) {
            checkUsageInTokens(tag.children);
          }
        }
      }
    }

    return {
      Tag(token: TagToken) {
        if (token.properties.name === 'let') {
          const varName = extractLetVariableName(token.properties.jsArg);
          if (varName) {
            variables.push({
              name: varName,
              token,
              used: false,
            });
          }
        }
      },

      Mustache(token: MustacheToken) {
        checkUsageInExpression(token.properties.jsArg);
      },

      SafeMustache(token: MustacheToken) {
        checkUsageInExpression(token.properties.jsArg);
      },

      'Program:exit'(tokens: Token[]) {
        // Do a final pass to check all usages
        checkUsageInTokens(tokens);

        // Report unused variables
        for (const varInfo of variables) {
          if (!varInfo.used) {
            context.report({
              node: varInfo.token,
              messageId: 'unused',
              data: { name: varInfo.name },
            });
          }
        }
      },
    };
  },
};
