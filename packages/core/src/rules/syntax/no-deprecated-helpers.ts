/**
 * Rule: no-deprecated-helpers
 *
 * Disallows deprecated global helpers that were removed in Edge.js v6:
 * - e() -> html.escape()
 * - stringify() -> js.stringify()
 * - safe() -> html.safe()
 * - raise() -> removed entirely
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Deprecated helpers and their replacements
const DEPRECATED_HELPERS: Record<string, { replacement: string | null; message: string }> = {
  e: {
    replacement: 'html.escape',
    message: 'The "e()" helper was removed in Edge.js v6. Use "html.escape()" instead.',
  },
  stringify: {
    replacement: 'js.stringify',
    message: 'The "stringify()" helper was removed in Edge.js v6. Use "js.stringify()" instead.',
  },
  safe: {
    replacement: 'html.safe',
    message: 'The "safe()" helper was removed in Edge.js v6. Use "html.safe()" instead.',
  },
  raise: {
    replacement: null,
    message: 'The "raise()" helper was removed in Edge.js v6 and has no replacement.',
  },
};

// Regex to find deprecated helpers anywhere in the expression
const HELPER_USAGE_REGEX = /\b(e|stringify|safe|raise)\s*\(/g;

export const noDeprecatedHelpers: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated global helpers removed in Edge.js v6',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/changelog/upgrading-to-v6',
    },
    messages: {
      deprecated: '{{ message }}',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkMustache(token: MustacheToken): void {
      const expression = token.properties.jsArg;

      // Find all deprecated helper usages in the expression
      let match: RegExpExecArray | null;
      HELPER_USAGE_REGEX.lastIndex = 0; // Reset regex state

      while ((match = HELPER_USAGE_REGEX.exec(expression)) !== null) {
        const helperName = match[1];
        const helperInfo = DEPRECATED_HELPERS[helperName];

        if (helperInfo) {
          context.report({
            node: token,
            messageId: 'deprecated',
            data: { message: helperInfo.message },
          });
        }
      }
    }

    return {
      Mustache: checkMustache,
      SafeMustache: checkMustache,
    };
  },
};
