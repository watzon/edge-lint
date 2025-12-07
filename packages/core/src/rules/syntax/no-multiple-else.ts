/**
 * Rule: no-multiple-else
 *
 * Disallows multiple @else blocks in a single conditional.
 * Only one @else is allowed per @if/@unless block.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

export const noMultipleElse: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow multiple @else blocks in a conditional',
      category: 'Syntax',
      recommended: true,
    },
    messages: {
      multipleElse: 'Multiple @else blocks are not allowed. Only one @else can exist per @if/@unless block.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkConditionalChildren(token: TagToken): void {
      const children = token.children;
      if (!children || children.length === 0) return;

      let elseCount = 0;

      for (const child of children) {
        if (child.type === 'tag') {
          const childTag = child as unknown as TagToken;
          if (childTag.properties.name === 'else') {
            elseCount++;
            if (elseCount > 1) {
              context.report({
                node: childTag,
                messageId: 'multipleElse',
              });
            }
          }
        }
      }
    }

    return {
      Tag(token: TagToken) {
        const name = token.properties.name;

        // Check @if and @unless blocks
        if (name === 'if' || name === 'unless') {
          checkConditionalChildren(token);
        }
      },
    };
  },
};
