/**
 * Rule: valid-vite-tag
 *
 * Validates @vite() tag syntax for AdonisJS projects.
 * The tag should receive an array of entry point paths.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Pattern to check for array syntax: starts with [ and ends with ]
const ARRAY_SYNTAX_PATTERN = /^\s*\[[\s\S]*\]\s*$/;

export const validViteTag: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Validate @vite() tag arguments',
      category: 'Syntax',
      recommended: false, // Only relevant for AdonisJS projects
    },
    messages: {
      missingArgs: '@vite() requires an array of entry points. Example: @vite([\'resources/js/app.js\'])',
      notArray: '@vite() argument should be an array. Example: @vite([\'resources/js/app.js\'])',
      emptyArray: '@vite() should have at least one entry point.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        if (token.properties.name !== 'vite') return;

        const jsArg = token.properties.jsArg.trim();

        // Check for missing arguments
        if (!jsArg) {
          context.report({
            node: token,
            messageId: 'missingArgs',
          });
          return;
        }

        // Check if it looks like an array
        if (!ARRAY_SYNTAX_PATTERN.test(jsArg)) {
          context.report({
            node: token,
            messageId: 'notArray',
          });
          return;
        }

        // Check for empty array
        const innerContent = jsArg.slice(1, -1).trim();
        if (!innerContent) {
          context.report({
            node: token,
            messageId: 'emptyArray',
          });
        }
      },
    };
  },
};
