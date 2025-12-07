/**
 * Rule: prefer-safe-mustache
 *
 * Suggests using {{{ }}} (safe/unescaped) for expressions that are known to be HTML-safe.
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Patterns that typically return safe HTML
const SAFE_PATTERNS = [
  /\bhtml\.safe\s*\(/i, // html.safe() helper
  /\.toHtml\s*\(\s*\)/i, // .toHtml() method
  /\.render\s*\(/i, // .render() method (components)
  /\$slots\.\w+\s*\(\s*\)/i, // $slots.name() (slot content)
];

// Patterns that suggest the content might be HTML
const HTML_HINT_PATTERNS = [
  /\bhtml\b/i,
  /\bmarkdown\b/i,
  /\brichText\b/i,
  /\bcontent\b/i,
  /\bbody\b/i,
];

export const preferSafeMustache: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using safe mustache for HTML content',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          patterns: {
            type: 'array',
            items: { type: 'string' },
          },
          strict: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    hasSuggestions: true,
    messages: {
      shouldBeSafe:
        'Expression "{{ expr }}" appears to return HTML. Consider using {{{ }}} to avoid double-escaping.',
      alreadyWrapped:
        'Expression uses html.safe() but is in escaped mustache. Use {{{ }}} instead.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const options = context.options[0] as { patterns?: string[]; strict?: boolean } | undefined;
    const customPatterns = options?.patterns?.map((p) => new RegExp(p, 'i')) ?? [];
    const strict = options?.strict ?? false;

    const allSafePatterns = [...SAFE_PATTERNS, ...customPatterns];
    const hintPatterns = strict ? [] : HTML_HINT_PATTERNS;

    return {
      Mustache(token: MustacheToken) {
        const expr = token.properties.jsArg;

        // Check if it's definitely safe content
        for (const pattern of allSafePatterns) {
          if (pattern.test(expr)) {
            context.report({
              node: token,
              messageId: 'alreadyWrapped',
              suggest: [
                {
                  desc: 'Use safe mustache {{{ }}}',
                  fix(fixer) {
                    const sourceCode = context.getSourceCode();
                    const range = sourceCode.getRange(token);
                    if (!range) return null;

                    const text = sourceCode.getText(token);
                    // Replace {{ with {{{ and }} with }}}
                    const newText = text.replace(/^\{\{/, '{{{').replace(/\}\}$/, '}}}');
                    return fixer.replaceTextRange(range, newText);
                  },
                },
              ],
            });
            return;
          }
        }

        // Check for hint patterns (less certain)
        if (!strict) {
          for (const pattern of hintPatterns) {
            if (pattern.test(expr)) {
              context.report({
                node: token,
                messageId: 'shouldBeSafe',
                data: { expr: expr.length > 30 ? expr.slice(0, 30) + '...' : expr },
                suggest: [
                  {
                    desc: 'Use safe mustache {{{ }}}',
                    fix(fixer) {
                      const sourceCode = context.getSourceCode();
                      const range = sourceCode.getRange(token);
                      if (!range) return null;

                      const text = sourceCode.getText(token);
                      const newText = text.replace(/^\{\{/, '{{{').replace(/\}\}$/, '}}}');
                      return fixer.replaceTextRange(range, newText);
                    },
                  },
                ],
              });
              return;
            }
          }
        }
      },
    };
  },
};
