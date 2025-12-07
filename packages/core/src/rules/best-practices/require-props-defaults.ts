/**
 * Rule: require-props-defaults
 *
 * Suggests using $props.merge() for default prop values instead of
 * inline fallbacks with || operators.
 *
 * This is a suggestion, not an error - inline fallbacks are valid but
 * $props.merge() is more maintainable for component props.
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Pattern to detect prop fallback usage: propName || 'default' or propName ?? 'default'
// Only triggers if it looks like a component prop (simple identifier with fallback)
const PROP_FALLBACK_PATTERN = /^\s*(\w+)\s*(\|\||[?]{2})\s*(['"][^'"]*['"]|[a-zA-Z0-9_]+)\s*$/;

export const requirePropsDefaults: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest $props.merge() for default prop values',
      category: 'Best Practices',
      recommended: false,
      url: 'https://edgejs.dev/docs/components/props#serializing-props-to-html-attributes',
    },
    messages: {
      usePropsMerge: 'Consider using "$props.merge({ {{ prop }}: {{ default }} })" instead of inline fallback for better maintainability.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkMustache(token: MustacheToken): void {
      const expr = token.properties.jsArg.trim();

      // Check if this looks like a prop fallback pattern
      const match = expr.match(PROP_FALLBACK_PATTERN);

      if (match) {
        const propName = match[1];
        const defaultValue = match[3];

        // Skip if it's already using $props
        if (propName.startsWith('$props')) return;

        // Skip common non-prop variables
        const skipVars = ['user', 'data', 'item', 'index', 'value', 'key', 'post', 'comment'];
        if (skipVars.includes(propName)) return;

        context.report({
          node: token,
          messageId: 'usePropsMerge',
          data: {
            prop: propName,
            default: defaultValue,
          },
        });
      }
    }

    return {
      Mustache: checkMustache,
      SafeMustache: checkMustache,
    };
  },
};
