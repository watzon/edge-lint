/**
 * Rule: mustache-spacing
 *
 * Enforces consistent spacing inside mustache braces.
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

type SpacingOption = 'always' | 'never';

export const mustacheSpacing: Rule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing inside mustache braces',
      category: 'Style',
      recommended: false,
    },
    fixable: 'whitespace',
    schema: [
      {
        enum: ['always', 'never'],
      },
    ],
    messages: {
      missingOpeningSpace: 'Expected space after opening braces.',
      missingClosingSpace: 'Expected space before closing braces.',
      unexpectedOpeningSpace: 'Unexpected space after opening braces.',
      unexpectedClosingSpace: 'Unexpected space before closing braces.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const option: SpacingOption = (context.options[0] as SpacingOption | undefined) ?? 'always';
    const requireSpace = option === 'always';
    const sourceCode = context.getSourceCode();

    function checkSpacing(token: MustacheToken): void {
      const jsArg = token.properties.jsArg;
      const isSafe = token.type === 's__mustache';

      // Determine brace patterns
      const openBraces = isSafe ? '{{{' : '{{';
      const closeBraces = isSafe ? '}}}' : '}}';

      // Check leading space
      const hasLeadingSpace = jsArg.length > 0 && (jsArg[0] === ' ' || jsArg[0] === '\t');
      const hasLeadingNewline = jsArg.length > 0 && jsArg[0] === '\n';

      // Check trailing space
      const hasTrailingSpace =
        jsArg.length > 0 && (jsArg[jsArg.length - 1] === ' ' || jsArg[jsArg.length - 1] === '\t');
      const hasTrailingNewline = jsArg.length > 0 && jsArg[jsArg.length - 1] === '\n';

      // Skip if multiline (newlines at boundaries)
      if (hasLeadingNewline || hasTrailingNewline) {
        return;
      }

      // Skip empty expressions (handled by no-empty-mustache)
      if (jsArg.trim() === '') {
        return;
      }

      const range = sourceCode.getRange(token);
      if (!range) return;

      // Check opening space
      if (requireSpace && !hasLeadingSpace) {
        context.report({
          node: token,
          messageId: 'missingOpeningSpace',
          fix(fixer) {
            // Insert space after opening braces
            const insertPos = range[0] + openBraces.length;
            return fixer.insertTextBeforeRange([insertPos, insertPos], ' ');
          },
        });
      } else if (!requireSpace && hasLeadingSpace) {
        context.report({
          node: token,
          messageId: 'unexpectedOpeningSpace',
          fix(fixer) {
            // Remove space after opening braces
            const start = range[0] + openBraces.length;
            let end = start;
            while (end < range[1] && (sourceCode.text[end] === ' ' || sourceCode.text[end] === '\t')) {
              end++;
            }
            return fixer.removeRange([start, end]);
          },
        });
      }

      // Check closing space
      if (requireSpace && !hasTrailingSpace) {
        context.report({
          node: token,
          messageId: 'missingClosingSpace',
          fix(fixer) {
            // Insert space before closing braces
            const insertPos = range[1] - closeBraces.length;
            return fixer.insertTextBeforeRange([insertPos, insertPos], ' ');
          },
        });
      } else if (!requireSpace && hasTrailingSpace) {
        context.report({
          node: token,
          messageId: 'unexpectedClosingSpace',
          fix(fixer) {
            // Remove space before closing braces
            const end = range[1] - closeBraces.length;
            let start = end;
            while (start > range[0] && (sourceCode.text[start - 1] === ' ' || sourceCode.text[start - 1] === '\t')) {
              start--;
            }
            return fixer.removeRange([start, end]);
          },
        });
      }
    }

    return {
      Mustache: checkSpacing,
      SafeMustache: checkSpacing,
    };
  },
};
