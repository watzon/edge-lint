/**
 * Rule: prefer-unless-over-negated-if
 *
 * Suggests using @unless(condition) instead of @if(!condition).
 *
 * Bad: @if(!account.isActive)
 * Good: @unless(account.isActive)
 */

import type { Rule, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Pattern to detect simple negation: !expression (not compound conditions)
// Match: !foo, !foo.bar, !foo(), !(foo)
// Don't match: !foo && bar, !foo || bar (compound)
function isSimpleNegation(expr: string): { isNegated: boolean; innerExpr: string } {
  const trimmed = expr.trim();

  // Must start with !
  if (!trimmed.startsWith('!')) {
    return { isNegated: false, innerExpr: '' };
  }

  // Get the expression after !
  let inner = trimmed.slice(1).trim();

  // Handle parenthesized negation: !( ... )
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.slice(1, -1).trim();
  }

  // Check if the remaining expression has compound operators (&&, ||)
  // Simple approach: if it contains && or || at the top level, it's compound
  // This is a simplified check - doesn't handle nested parens perfectly
  if (/&&|\|\|/.test(inner) && !isFullyParenthesized(inner)) {
    return { isNegated: false, innerExpr: '' };
  }

  return { isNegated: true, innerExpr: inner };
}

function isFullyParenthesized(expr: string): boolean {
  // Check if expression is wrapped in parens: (a && b)
  if (!expr.startsWith('(') || !expr.endsWith(')')) return false;
  // Very basic check - could be improved
  return true;
}

export const preferUnlessOverNegatedIf: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest @unless over @if with negation',
      category: 'Best Practices',
      recommended: false,
      url: 'https://edgejs.dev/docs/conditionals',
    },
    fixable: 'code',
    messages: {
      useUnless: 'Use "@unless({{ inner }})" instead of "@if(!{{ inner }})" for cleaner code.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    return {
      Tag(token: TagToken) {
        if (token.properties.name !== 'if') return;

        const { isNegated, innerExpr } = isSimpleNegation(token.properties.jsArg);

        if (isNegated && innerExpr) {
          const sourceCode = context.getSourceCode();
          const range = sourceCode.getRange(token);

          context.report({
            node: token,
            messageId: 'useUnless',
            data: { inner: innerExpr },
            fix: range ? (fixer) => {
              // Replace @if(!expr) with @unless(expr)
              const text = sourceCode.getText(token);
              // Replace the tag name and remove the negation
              const newText = text
                .replace(/@if\s*\(\s*!\s*/, '@unless(')
                .replace(/@if\s*\(\s*!\s*\(\s*/, '@unless(')
                .replace(/\)\s*\)$/, ')'); // Remove extra closing paren if needed
              return fixer.replaceTextRange(range, newText);
            } : undefined,
          });
        }
      },
    };
  },
};
