/**
 * Rule: no-raw-html-in-mustache
 *
 * Warns about potential XSS when using {{{ }}} (safe mustache).
 * Triple braces bypass HTML escaping, which can be dangerous.
 *
 * Certain patterns are considered safe:
 * - $slots calls (trusted content)
 * - html.safe() (explicitly marked)
 * - nl2br() helper (controlled HTML)
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Patterns that are considered safe and don't need warnings
const SAFE_PATTERNS = [
  /\$slots\.\w+\s*\(/,  // Slot calls
  /\bhtml\.safe\s*\(/,   // Explicitly safe
  /\bnl2br\s*\(/,        // nl2br helper
  /\binspect\s*\(/,      // inspect helper (debugging)
];

export const noRawHtmlInMustache: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about potential XSS with unescaped output',
      category: 'Best Practices',
      recommended: false, // Off by default, can be noisy
      url: 'https://edgejs.dev/docs/interpolation#escaped-html-output',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional patterns to consider safe (as regex strings)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      xssRisk: 'Using {{{ }}} bypasses HTML escaping. Ensure "{{ expr }}" is trusted to avoid XSS vulnerabilities.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const options = context.options[0] as { allowPatterns?: string[] } | undefined;
    const customPatterns = (options?.allowPatterns ?? []).map((p) => new RegExp(p));
    const allSafePatterns = [...SAFE_PATTERNS, ...customPatterns];

    return {
      SafeMustache(token: MustacheToken) {
        const expr = token.properties.jsArg;

        // Check if expression matches any safe pattern
        const isSafe = allSafePatterns.some((pattern) => pattern.test(expr));

        if (!isSafe) {
          context.report({
            node: token,
            messageId: 'xssRisk',
            data: {
              expr: expr.length > 40 ? expr.slice(0, 40) + '...' : expr,
            },
          });
        }
      },
    };
  },
};
