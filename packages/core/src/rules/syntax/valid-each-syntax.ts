/**
 * Rule: valid-each-syntax
 *
 * Validates @each loop syntax in Edge.js templates.
 *
 * Valid: @each(item in items), @each((item, index) in items), @each((value, key) in obj)
 * Invalid: @each(item of items), @each(item), @each(in items)
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Valid patterns for @each
const SIMPLE_EACH = /^(\w+)\s+in\s+(.+)$/;  // item in collection
const TUPLE_EACH = /^\((\w+)\s*,\s*(\w+)\)\s+in\s+(.+)$/;  // (item, index) in collection

export const validEachSyntax: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate @each loop syntax',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/loops',
    },
    messages: {
      invalidSyntax: 'Invalid @each syntax. Expected "@each(item in collection)" or "@each((item, index) in collection)".',
      useInNotOf: 'Use "in" instead of "of" in @each loops. Edge.js uses "@each(item in collection)".',
      missingIn: 'Missing "in" keyword in @each loop. Use "@each(item in collection)".',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        if (token.properties.name !== 'each') return;

        const jsArg = token.properties.jsArg.trim();

        // Check for empty argument
        if (!jsArg) {
          context.report({
            node: token,
            messageId: 'invalidSyntax',
          });
          return;
        }

        // Check for common mistake: using "of" instead of "in"
        if (/\s+of\s+/.test(jsArg)) {
          context.report({
            node: token,
            messageId: 'useInNotOf',
          });
          return;
        }

        // Check if "in" keyword is present
        if (!jsArg.includes(' in ')) {
          context.report({
            node: token,
            messageId: 'missingIn',
          });
          return;
        }

        // Validate against known valid patterns
        const isSimpleEach = SIMPLE_EACH.test(jsArg);
        const isTupleEach = TUPLE_EACH.test(jsArg);

        if (!isSimpleEach && !isTupleEach) {
          context.report({
            node: token,
            messageId: 'invalidSyntax',
          });
        }
      },
    };
  },
};
