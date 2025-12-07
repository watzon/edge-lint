/**
 * Rule: no-reserved-variable-names
 *
 * Disallows using Edge.js reserved keywords as variable names.
 * Reserved: template, $context, state, $filename
 *
 * These are used internally and redefining them causes runtime errors.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Reserved variable names in Edge.js
const RESERVED_NAMES = new Set([
  'template',
  '$context',
  'state',
  '$filename',
]);

// Extract variable name from @let expression: @let(varName = value) or @let(varName)
function extractVariableName(jsArg: string): string | null {
  const trimmed = jsArg.trim();
  const match = trimmed.match(/^(\$?\w+)\s*(?:=|$)/);
  return match?.[1] ?? null;
}

export const noReservedVariableNames: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using reserved Edge.js keywords as variable names',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/getting_started#reserved-keywords',
    },
    messages: {
      reserved: '"{{ name }}" is a reserved Edge.js keyword and cannot be used as a variable name.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        // Only check @let tags
        if (token.properties.name !== 'let') return;

        const varName = extractVariableName(token.properties.jsArg);
        if (varName && RESERVED_NAMES.has(varName)) {
          context.report({
            node: token,
            messageId: 'reserved',
            data: { name: varName },
          });
        }
      },
    };
  },
};
