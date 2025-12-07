/**
 * Rule: no-end-after-selfclosed
 *
 * Disallows @end tags after self-closing tags (@!tag).
 * Self-closing tags don't have children and don't need an @end.
 * Having @end after a self-closed tag will incorrectly close an earlier block.
 *
 * Note: When the lexer encounters a self-closed tag (@!), it does NOT consume
 * the following @end as a tag - it becomes raw text. This rule detects that
 * raw text "@end" pattern after self-closed tags.
 *
 * Invalid:
 *   @!ui.button({ text: 'Click' })
 *   @end
 *
 * Valid:
 *   @!ui.button({ text: 'Click' })
 *
 *   @ui.card()
 *     content
 *   @end
 */

import type { Rule, TagToken, RawToken, TokenVisitor, RuleContext } from '../../types/index.js';
import type { Token } from 'edge-lexer/types';

// Pattern to match @end in raw text (with optional leading whitespace)
const END_PATTERN = /^\s*@end\s*$/;

export const noEndAfterSelfclosed: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow @end tags after self-closing tags',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/syntax_specification',
    },
    fixable: 'code',
    messages: {
      unexpectedEnd:
        'Unexpected @end after self-closing tag "@!{{ name }}". Self-closing tags do not need @end.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const sourceCode = context.getSourceCode();

    return {
      Program(tokens: Token[]) {
        // Process tokens at each level to find @end after self-closed tags
        checkTokensForInvalidEnd(tokens);

        function checkTokensForInvalidEnd(tokenList: Token[]): void {
          let lastSelfClosedTag: TagToken | null = null;

          for (const token of tokenList) {
            if (token.type === 'tag') {
              const tagToken = token as unknown as TagToken;

              if (tagToken.properties.selfclosed) {
                // Track the self-closed tag
                lastSelfClosedTag = tagToken;
              } else if (tagToken.properties.name === 'end') {
                // Found a real @end tag - check if it follows a self-closed tag
                // (This case may not happen since lexer doesn't produce @end after self-closed)
                if (lastSelfClosedTag) {
                  reportInvalidEnd(tagToken, lastSelfClosedTag);
                }
                lastSelfClosedTag = null;
              } else {
                // Any other block tag resets tracking
                lastSelfClosedTag = null;

                // Recursively check children of block tags
                if (tagToken.children && tagToken.children.length > 0) {
                  checkTokensForInvalidEnd(tagToken.children as Token[]);
                }
              }
            } else if (token.type === 'raw') {
              const rawToken = token as unknown as RawToken;
              const rawValue = rawToken.value;

              // Check if this raw token is an @end that follows a self-closed tag
              if (lastSelfClosedTag && END_PATTERN.test(rawValue)) {
                reportInvalidEndRaw(rawToken, lastSelfClosedTag);
                lastSelfClosedTag = null;
              } else if (rawValue.trim() !== '') {
                // Non-whitespace, non-@end content resets tracking
                lastSelfClosedTag = null;
              }
            } else if (token.type === 'mustache' || token.type === 's__mustache') {
              // Mustache output resets tracking (there's actual content)
              lastSelfClosedTag = null;
            }
            // newlines and comments don't reset tracking
          }
        }

        function reportInvalidEnd(endToken: TagToken, selfClosedTag: TagToken): void {
          const range = sourceCode.getRange(endToken);

          context.report({
            node: endToken,
            messageId: 'unexpectedEnd',
            data: { name: selfClosedTag.properties.name },
            fix: range ? (fixer) => createRemoveFix(fixer, range) : undefined,
          });
        }

        function reportInvalidEndRaw(rawToken: RawToken, selfClosedTag: TagToken): void {
          // For raw tokens, we need to calculate the range manually
          const line = rawToken.line;
          const text = sourceCode.getText();
          const lines = sourceCode.getLines();

          // Find the start of this line
          let lineStart = 0;
          for (let i = 0; i < line - 1; i++) {
            lineStart += lines[i].length + 1; // +1 for newline
          }

          // Find @end position within the line
          const lineContent = lines[line - 1];
          const endMatch = lineContent.match(/@end/);
          if (!endMatch || endMatch.index === undefined) return;

          const start = lineStart + endMatch.index;
          const end = start + 4; // "@end".length

          context.report({
            loc: {
              start: { line, column: endMatch.index },
              end: { line, column: endMatch.index + 4 },
            },
            messageId: 'unexpectedEnd',
            data: { name: selfClosedTag.properties.name },
            fix: (fixer) => {
              // Remove the entire line containing @end
              let removeStart = lineStart;
              let removeEnd = end;

              // Include trailing whitespace
              while (removeEnd < text.length && text[removeEnd] !== '\n') {
                removeEnd++;
              }

              // Include the newline if present
              if (removeEnd < text.length && text[removeEnd] === '\n') {
                removeEnd++;
              }

              // If this leaves a blank line at start, adjust
              if (removeStart > 0 && text[removeStart - 1] === '\n') {
                removeStart--; // Remove preceding newline instead
                removeEnd--; // Don't double-remove
              }

              return fixer.removeRange([removeStart, removeEnd]);
            },
          });
        }

        function createRemoveFix(
          fixer: Parameters<NonNullable<Parameters<typeof context.report>[0]['fix']>>[0],
          range: [number, number]
        ) {
          const text = sourceCode.getText();
          let start = range[0];
          let end = range[1];

          // Expand backward to remove leading whitespace on the same line
          while (start > 0 && (text[start - 1] === ' ' || text[start - 1] === '\t')) {
            start--;
          }

          // If we're at the start of a line, also remove the newline before
          if (start > 0 && text[start - 1] === '\n') {
            start--;
          }

          return fixer.removeRange([start, end]);
        }
      },
    };
  },
};
