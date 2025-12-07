/**
 * Rule: no-unknown-tag
 *
 * Warns when using tags that are not registered with Edge.js
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Default Edge.js v6 tags
const DEFAULT_TAGS = new Set([
  'if',
  'elseif',
  'else',
  'unless',
  'each',
  'let',
  'assign',
  'include',
  'includeIf',
  'component',
  'slot',
  'inject',
  'debugger',
  'svg',
  'entryPointStyles',
  'entryPointScripts',
  'vite',
  // End tags
  'end',
  'endif',
  'endunless',
  'endeach',
  'endcomponent',
  'endslot',
  // Removed in v6 but still recognized (caught by no-removed-tags rule):
  // 'set', 'layout', 'section', 'yield', 'super', 'endsection'
]);

export const noUnknownTag: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when using unregistered tags',
      category: 'Syntax',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedTags: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknown: 'Unknown tag "@{{ name }}". If this is a custom tag, add it to the allowed list.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const options = context.options[0] as { allowedTags?: string[] } | undefined;
    const allowedTags = new Set(options?.allowedTags ?? []);

    // Also check parser options for custom tags
    const customTags = context.parserOptions.tags ?? {};
    for (const tagName of Object.keys(customTags)) {
      allowedTags.add(tagName);
    }

    // Check settings for additional tags
    const settingsTags = context.settings['edge/tags'] as Record<string, unknown> | undefined;
    if (settingsTags) {
      for (const tagName of Object.keys(settingsTags)) {
        allowedTags.add(tagName);
      }
    }

    return {
      Tag(token: TagToken) {
        const tagName = token.properties.name;

        // Check if it's a known or allowed tag
        if (!DEFAULT_TAGS.has(tagName) && !allowedTags.has(tagName)) {
          context.report({
            node: token,
            messageId: 'unknown',
            data: { name: tagName },
          });
        }
      },
    };
  },
};
