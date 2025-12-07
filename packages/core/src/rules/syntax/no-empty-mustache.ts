/**
 * Rule: no-empty-mustache
 *
 * Disallows empty mustache expressions like {{ }} or {{{ }}}
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

export const noEmptyMustache: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow empty mustache expressions',
      category: 'Syntax',
      recommended: true,
    },
    messages: {
      empty: 'Empty mustache expression is not allowed.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkMustache(token: MustacheToken): void {
      const jsArg = token.properties.jsArg.trim();
      if (jsArg === '') {
        context.report({
          node: token,
          messageId: 'empty',
        });
      }
    }

    return {
      Mustache: checkMustache,
      SafeMustache: checkMustache,
    };
  },
};
