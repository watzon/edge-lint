/**
 * Rule: valid-entrypoint-tags
 *
 * Validates @entryPointStyles() and @entryPointScripts() tags.
 * These tags should receive an entry point name as argument.
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Entry point tags to check
const ENTRYPOINT_TAGS = new Set(['entryPointStyles', 'entryPointScripts']);

export const validEntrypointTags: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Validate @entryPointStyles() and @entryPointScripts() tags',
      category: 'Syntax',
      recommended: false, // Only relevant for AdonisJS projects
    },
    messages: {
      missingArg: '@{{ tag }}() requires an entry point name. Example: @{{ tag }}(\'app\')',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        const tagName = token.properties.name;

        if (!ENTRYPOINT_TAGS.has(tagName)) return;

        const jsArg = token.properties.jsArg.trim();

        // Check for missing argument
        if (!jsArg) {
          context.report({
            node: token,
            messageId: 'missingArg',
            data: { tag: tagName },
          });
        }
      },
    };
  },
};
