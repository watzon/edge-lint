/**
 * Rule: prefer-stack-push-once
 *
 * Suggests using @pushOnceTo over @pushTo for script/style content
 * to prevent duplicate scripts when components are reused.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext, LexerToken } from '../../types/index.js';

// Pattern to detect script or style tags in children
const SCRIPT_STYLE_PATTERN = /<\s*(script|style|link)\b/i;

export const preferStackPushOnce: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest @pushOnceTo over @pushTo for scripts/styles',
      category: 'Best Practices',
      recommended: false,
      url: 'https://edgejs.dev/docs/stacks',
    },
    messages: {
      usePushOnce: 'Use "@pushOnceTo" instead of "@pushTo" for script/style content to prevent duplicates when the component is reused.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        // Only check @pushTo tags
        if (token.properties.name !== 'pushTo') return;

        const children = token.children;
        if (!children || children.length === 0) return;

        // Check if any child contains script/style/link tags
        const hasScriptOrStyle = checkChildrenForScriptStyle(children);

        if (hasScriptOrStyle) {
          context.report({
            node: token,
            messageId: 'usePushOnce',
          });
        }
      },
    };
  },
};

function checkChildrenForScriptStyle(children: LexerToken[]): boolean {
  for (const child of children) {
    if (child.type === 'raw') {
      const rawValue = (child as { value?: string }).value ?? '';
      if (SCRIPT_STYLE_PATTERN.test(rawValue)) {
        return true;
      }
    }
    // Recursively check nested children
    if ('children' in child && Array.isArray(child.children)) {
      if (checkChildrenForScriptStyle(child.children as LexerToken[])) {
        return true;
      }
    }
  }
  return false;
}
