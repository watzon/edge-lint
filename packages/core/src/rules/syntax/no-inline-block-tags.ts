/**
 * Rule: no-inline-block-tags
 *
 * Disallows block tags and their content on the same line.
 * In Edge.js, block tags like @if, @each, @component must have
 * their content on separate lines.
 *
 * Bad:  @if(condition) content @end
 * Good: @if(condition)
 *         content
 *       @end
 */

import type { Rule, TagToken, TokenVisitor, RuleContext, LexerToken } from '../../types/index.js';

// Block tags that require multiline content
const BLOCK_TAGS = new Set([
  'if',
  'unless',
  'each',
  'component',
  'slot',
  'section', // deprecated but still check for helpful error
]);

export const noInlineBlockTags: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow block tags with content on the same line',
      category: 'Syntax',
      recommended: true,
    },
    messages: {
      inlineContent:
        'Block tag "@{{ name }}" cannot have content on the same line. Move content to the next line.',
      inlineEnd:
        'Block tag "@{{ name }}" and its @end cannot be on the same line. Move @end to a separate line.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        const tagName = token.properties.name;

        // Only check block tags
        if (!BLOCK_TAGS.has(tagName)) {
          return;
        }

        // Check if tag has children (content)
        const children = token.children;
        if (!children || children.length === 0) {
          return;
        }

        const tagStartLine = token.loc.start.line;

        // Check each child to see if any non-newline content is on the same line as the opening tag
        for (const child of children) {
          const childLine = getTokenLine(child);
          const childType = child.type as string;

          if (childLine === tagStartLine) {
            // Skip if it's just a newline token
            if (childType === 'newline') {
              continue;
            }

            // Check if this is the end tag on the same line
            if (childType === 'tag' && isEndTag(child)) {
              context.report({
                node: token,
                messageId: 'inlineEnd',
                data: { name: tagName },
              });
            } else if (childType === 'raw') {
              // Check if raw content is non-whitespace
              const rawValue = (child as { value?: string }).value ?? '';
              if (rawValue.trim() !== '') {
                context.report({
                  node: token,
                  messageId: 'inlineContent',
                  data: { name: tagName },
                });
              }
            } else if (childType !== 'newline') {
              // Any other non-newline content on same line
              context.report({
                node: token,
                messageId: 'inlineContent',
                data: { name: tagName },
              });
            }

            // Only report once per tag
            break;
          }
        }
      },
    };
  },
};

/**
 * Get the line number of a token
 */
function getTokenLine(token: LexerToken): number {
  if ('loc' in token && token.loc) {
    return (token.loc as { start: { line: number } }).start.line;
  }
  if ('line' in token && typeof token.line === 'number') {
    return token.line;
  }
  return -1;
}

/**
 * Check if a tag token is an end tag
 */
function isEndTag(token: LexerToken): boolean {
  // Type assertion needed because edge-lexer types are complex
  const tokenType = token.type as string;
  if (tokenType !== 'tag') {
    return false;
  }
  const props = (token as unknown as TagToken).properties;
  const name = props?.name ?? '';
  return name === 'end' || name.startsWith('end');
}
