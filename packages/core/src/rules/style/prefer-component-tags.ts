/**
 * Rule: prefer-component-tags
 *
 * Suggests using component-as-tags syntax instead of @component().
 * Components in the components/ directory can be used directly as tags.
 *
 * Bad: @component('components/button', { text: 'Click' })
 * Good: @button({ text: 'Click' })
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Pattern to match component paths that can be simplified
// e.g., 'components/button' or "components/form/input"
const COMPONENT_PATH_REGEX = /^['"]components\/([^'"]+)['"]/;

// Convert file path to tag name
// components/button → button
// components/form/input → form.input
// components/checkout_form/input → checkoutForm.input
function pathToTagName(path: string): string {
  // Remove .edge extension if present
  const cleanPath = path.replace(/\.edge$/, '');

  // Split by / and convert each segment
  const segments = cleanPath.split('/');

  // Convert snake_case to camelCase for each segment
  const converted = segments.map((segment) => {
    return segment.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  });

  // Handle index files: form/index → form
  if (converted.length > 1 && converted[converted.length - 1] === 'index') {
    converted.pop();
  }

  return converted.join('.');
}

export const preferComponentTags: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest component-as-tags syntax over @component()',
      category: 'Style',
      recommended: false,
      url: 'https://edgejs.dev/docs/components/introduction#components-as-tags',
    },
    messages: {
      useTagSyntax: 'Use "@{{ tagName }}()" instead of "@component(\'components/{{ path }}\', ...)".',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        if (token.properties.name !== 'component') return;

        const jsArg = token.properties.jsArg;
        const match = jsArg.match(COMPONENT_PATH_REGEX);

        if (match) {
          const componentPath = match[1];
          const tagName = pathToTagName(componentPath);

          context.report({
            node: token,
            messageId: 'useTagSyntax',
            data: {
              tagName,
              path: componentPath,
            },
          });
        }
      },
    };
  },
};
