/**
 * Strict configuration for Edge.js templates
 */

import type { Linter } from 'eslint';

export const strict: Linter.Config = {
  rules: {
    '@edge-lint/no-empty-mustache': 'error',
    '@edge-lint/valid-expression': 'error',
    '@edge-lint/no-unknown-tag': 'error',
    '@edge-lint/no-unused-let': 'error',
    '@edge-lint/prefer-safe-mustache': 'warn',
    '@edge-lint/mustache-spacing': ['error', 'always'],
  },
};

