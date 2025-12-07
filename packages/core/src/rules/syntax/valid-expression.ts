/**
 * Rule: valid-expression
 *
 * Validates that JavaScript expressions in mustaches and tags are syntactically valid.
 */

import type { Rule, MustacheToken, TagToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Simple JavaScript expression validator
// Uses a basic approach - tries to wrap in parentheses and check for obvious errors
function isValidExpression(expr: string): { valid: boolean; error?: string } {
  const trimmed = expr.trim();
  if (trimmed === '') {
    return { valid: true }; // Empty is handled by no-empty-mustache
  }

  // Check for common syntax errors
  const checks = [
    // Unmatched brackets
    { regex: /\([^)]*$/, error: 'Unclosed parenthesis' },
    { regex: /\[[^\]]*$/, error: 'Unclosed bracket' },
    { regex: /\{[^}]*$/, error: 'Unclosed brace' },

    // Trailing operators
    { regex: /[+\-*/%&|^]=?\s*$/, error: 'Expression ends with operator' },
    { regex: /\.\s*$/, error: 'Expression ends with dot' },
    { regex: /,\s*$/, error: 'Expression ends with comma' },

    // Invalid start
    { regex: /^\s*[+*/%&|^]/, error: 'Expression starts with invalid operator' },
    { regex: /^\s*\)/, error: 'Expression starts with closing parenthesis' },
    { regex: /^\s*\]/, error: 'Expression starts with closing bracket' },
    { regex: /^\s*\}/, error: 'Expression starts with closing brace' },
  ];

  for (const check of checks) {
    if (check.regex.test(trimmed)) {
      return { valid: false, error: check.error };
    }
  }

  // Check bracket balance
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  let inString: string | null = null;
  let escaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }

    switch (char) {
      case '(':
        parenDepth++;
        break;
      case ')':
        parenDepth--;
        if (parenDepth < 0) return { valid: false, error: 'Unmatched closing parenthesis' };
        break;
      case '[':
        bracketDepth++;
        break;
      case ']':
        bracketDepth--;
        if (bracketDepth < 0) return { valid: false, error: 'Unmatched closing bracket' };
        break;
      case '{':
        braceDepth++;
        break;
      case '}':
        braceDepth--;
        if (braceDepth < 0) return { valid: false, error: 'Unmatched closing brace' };
        break;
    }
  }

  if (inString) {
    return { valid: false, error: `Unclosed string (started with ${inString})` };
  }

  if (parenDepth !== 0) {
    return { valid: false, error: 'Unmatched parentheses' };
  }

  if (bracketDepth !== 0) {
    return { valid: false, error: 'Unmatched brackets' };
  }

  if (braceDepth !== 0) {
    return { valid: false, error: 'Unmatched braces' };
  }

  return { valid: true };
}

export const validExpression: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate JavaScript expressions in mustaches and tags',
      category: 'Syntax',
      recommended: true,
    },
    messages: {
      invalid: 'Invalid expression: {{ error }}',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkExpression(jsArg: string, token: MustacheToken | TagToken): void {
      const result = isValidExpression(jsArg);
      if (!result.valid) {
        context.report({
          node: token,
          messageId: 'invalid',
          data: { error: result.error ?? 'Unknown error' },
        });
      }
    }

    return {
      Mustache(token: MustacheToken) {
        checkExpression(token.properties.jsArg, token);
      },
      SafeMustache(token: MustacheToken) {
        checkExpression(token.properties.jsArg, token);
      },
      Tag(token: TagToken) {
        if (token.properties.jsArg) {
          checkExpression(token.properties.jsArg, token);
        }
      },
    };
  },
};
