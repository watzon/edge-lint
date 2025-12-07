/**
 * Rule: no-invalid-end-tag
 *
 * Disallows invalid end tag names like @endif, @endunless, @endeach.
 * Edge.js v6 only uses @end for all closing tags.
 *
 * Invalid: @endif, @endunless, @endeach, @endcomponent, @endslot
 * Valid: @end
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Invalid end tags (Edge.js v6 only uses @end)
const INVALID_END_TAGS = new Set([
  'endif',
  'endunless',
  'endeach',
  'endcomponent',
  'endslot',
  'endsection', // deprecated but might still be used
]);

export const noInvalidEndTag: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow invalid end tag names (use @end instead)',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/syntax_specification',
    },
    fixable: 'code',
    messages: {
      invalidEndTag: '"@{{ name }}" is not valid in Edge.js v6. Use "@end" instead.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        const tagName = token.properties.name;

        if (INVALID_END_TAGS.has(tagName)) {
          const sourceCode = context.getSourceCode();
          const range = sourceCode.getRange(token);

          context.report({
            node: token,
            messageId: 'invalidEndTag',
            data: { name: tagName },
            fix: range ? (fixer) => {
              // Replace @endif/@endunless/etc with @end
              const text = sourceCode.getText(token);
              const newText = text.replace(new RegExp(`@${tagName}`), '@end');
              return fixer.replaceTextRange(range, newText);
            } : undefined,
          });
        }
      },
    };
  },
};
