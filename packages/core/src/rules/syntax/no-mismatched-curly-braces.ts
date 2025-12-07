/**
 * Rule: no-mismatched-curly-braces
 *
 * Ensures mustache braces are properly matched.
 * Checks that {{ }} and {{{ }}} patterns are consistent.
 *
 * Note: The lexer catches most issues, but this provides an
 * additional check on the token structure itself.
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

export const noMismatchedCurlyBraces: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure mustache braces are properly matched',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/interpolation',
    },
    messages: {
      mismatch: 'Mismatched mustache braces. Ensure opening and closing braces match.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkMustache(token: MustacheToken): void {
      const sourceCode = context.getSourceCode();
      const range = sourceCode.getRange(token);

      if (!range) return;

      const text = sourceCode.text.slice(range[0], range[1]);

      // Check for proper brace structure
      // {{ ... }} or {{{ ... }}}
      const isSafe = token.type === 's__mustache';
      const expectedOpen = isSafe ? '{{{' : '{{';
      const expectedClose = isSafe ? '}}}' : '}}';

      const startsCorrectly = text.startsWith(expectedOpen);
      const endsCorrectly = text.endsWith(expectedClose);

      // Additional check: ensure we don't have extra braces
      const trimmedStart = text.match(/^\{+/)?.[0] ?? '';
      const trimmedEnd = text.match(/\}+$/)?.[0] ?? '';

      const expectedBraceCount = isSafe ? 3 : 2;

      if (
        !startsCorrectly ||
        !endsCorrectly ||
        trimmedStart.length !== expectedBraceCount ||
        trimmedEnd.length !== expectedBraceCount
      ) {
        context.report({
          node: token,
          messageId: 'mismatch',
        });
      }
    }

    return {
      Mustache: checkMustache,
      SafeMustache: checkMustache,
    };
  },
};
