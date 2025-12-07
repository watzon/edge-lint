/**
 * Rule: no-removed-tags
 *
 * Disallows tags that were removed in Edge.js v6:
 * - @set (use @let or @assign instead)
 * - @layout, @section, @yield, @super (use components instead)
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Tags removed in v6 and their replacements
const REMOVED_TAGS: Record<string, { replacement: string; message: string }> = {
  set: {
    replacement: '@let or @assign',
    message:
      'The @set tag was removed in Edge.js v6. Use @let(name = value) to define variables or @assign(name = value) to update them.',
  },
  layout: {
    replacement: 'components',
    message:
      'Layouts were removed in Edge.js v6. Use components instead. See https://edgejs.dev/docs/changelog/upgrading-to-v6',
  },
  section: {
    replacement: 'components with @slot',
    message:
      'Sections were removed in Edge.js v6. Use components with @slot instead. See https://edgejs.dev/docs/changelog/upgrading-to-v6',
  },
  yield: {
    replacement: '@slot',
    message:
      'The @yield tag was removed in Edge.js v6. Use @slot in components instead. See https://edgejs.dev/docs/changelog/upgrading-to-v6',
  },
  super: {
    replacement: 'component composition',
    message:
      'The @super tag was removed in Edge.js v6. Use component composition instead. See https://edgejs.dev/docs/changelog/upgrading-to-v6',
  },
};

export const noRemovedTags: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow tags that were removed in Edge.js v6',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/changelog/upgrading-to-v6',
    },
    messages: {
      removed: '{{ message }}',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        const tagName = token.properties.name;
        const removedInfo = REMOVED_TAGS[tagName];

        if (removedInfo) {
          context.report({
            node: token,
            messageId: 'removed',
            data: { message: removedInfo.message },
          });
        }
      },
    };
  },
};
