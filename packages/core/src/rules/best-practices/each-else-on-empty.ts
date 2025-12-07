/**
 * Rule: each-else-on-empty
 *
 * Suggests using @else with @each loops to handle empty collections.
 * This provides a better user experience when displaying lists.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

export const eachElseOnEmpty: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest @else with @each for empty collection handling',
      category: 'Best Practices',
      recommended: false, // Not everyone wants this check
      url: 'https://edgejs.dev/docs/loops#defining-fallback-content',
    },
    messages: {
      missingElse: 'Consider adding an @else block to handle empty collections in this @each loop.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        if (token.properties.name !== 'each') return;

        const children = token.children;
        if (!children || children.length === 0) return;

        // Check if there's an @else child
        const hasElse = children.some((child) => {
          if (child.type === 'tag') {
            const childTag = child as unknown as TagToken;
            return childTag.properties.name === 'else';
          }
          return false;
        });

        if (!hasElse) {
          context.report({
            node: token,
            messageId: 'missingElse',
          });
        }
      },
    };
  },
};
