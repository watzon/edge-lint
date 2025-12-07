/**
 * Rule: no-space-before-tag-args
 *
 * Disallows space between tag name and opening parenthesis.
 * In Edge.js, @if (condition) is invalid - must be @if(condition).
 * Also catches @! component() which should be @!component()
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

export const noSpaceBeforeTagArgs: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow space between tag name and opening parenthesis',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/syntax_specification',
    },
    fixable: 'whitespace',
    messages: {
      noSpace:
        'Unexpected space between "@{{ name }}" and opening parenthesis. Use "@{{ name }}(" instead.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        const sourceCode = context.getSourceCode();
        const tagName = token.properties.name;

        // Get the tag's range in source
        const range = sourceCode.getRange(token);
        if (!range) return;

        // Get the full text of the tag
        const tagText = sourceCode.text.slice(range[0], range[1]);

        // The tag should start with @tagName(
        // Check if there's whitespace between tagName and (
        // Pattern: @tagName + whitespace + (
        const tagPrefix = `@${tagName}`;

        // Find where the tag name ends
        const tagNameEnd = tagText.indexOf(tagPrefix) + tagPrefix.length;

        // Check if there's whitespace before the opening parenthesis
        // The opening paren should be at tagNameEnd
        let spaceStart = tagNameEnd;
        let spaceEnd = tagNameEnd;

        // Count whitespace characters
        while (spaceEnd < tagText.length && /\s/.test(tagText[spaceEnd]!)) {
          spaceEnd++;
        }

        // If there's space and the next character is '(', report it
        if (spaceEnd > spaceStart && tagText[spaceEnd] === '(') {
          const absoluteSpaceStart = range[0] + spaceStart;
          const absoluteSpaceEnd = range[0] + spaceEnd;

          context.report({
            node: token,
            messageId: 'noSpace',
            data: { name: tagName },
            fix(fixer) {
              // Remove the whitespace between tag name and (
              return fixer.removeRange([absoluteSpaceStart, absoluteSpaceEnd]);
            },
          });
        }
      },
    };
  },
};
