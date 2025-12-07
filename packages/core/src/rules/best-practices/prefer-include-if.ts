/**
 * Rule: prefer-include-if
 *
 * Suggests using @includeIf(condition, 'partial') instead of
 * @if(condition) @include('partial') @end pattern.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

export const preferIncludeIf: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest @includeIf over @if + @include pattern',
      category: 'Best Practices',
      recommended: false,
      url: 'https://edgejs.dev/docs/partials#include-conditionally',
    },
    messages: {
      useIncludeIf: 'Use "@includeIf({{ condition }}, {{ partial }})" instead of "@if + @include" pattern.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        // Only check @if tags
        if (token.properties.name !== 'if') return;

        const children = token.children;
        if (!children || children.length === 0) return;

        // Check if the only meaningful content is a single @include
        // Filter out newlines and whitespace-only raw tokens
        const meaningfulChildren = children.filter((child) => {
          if (child.type === 'newline') return false;
          if (child.type === 'raw') {
            const rawToken = child as { value?: string };
            return rawToken.value?.trim() !== '';
          }
          return true;
        });

        // If there's exactly one child and it's an @include or @!include tag
        if (meaningfulChildren.length === 1) {
          const child = meaningfulChildren[0];
          if (child.type === 'tag') {
            const childTag = child as unknown as TagToken;
            if (childTag.properties.name === 'include') {
              const condition = token.properties.jsArg;
              const partial = childTag.properties.jsArg;

              context.report({
                node: token,
                messageId: 'useIncludeIf',
                data: {
                  condition: condition.length > 30 ? condition.slice(0, 30) + '...' : condition,
                  partial: partial.length > 30 ? partial.slice(0, 30) + '...' : partial,
                },
              });
            }
          }
        }
      },
    };
  },
};
