/**
 * Recommended configuration for Edge.js templates
 */

import type { Linter } from 'eslint';

export const recommended: Linter.Config = {
  rules: {
    '@edge-lint/no-empty-mustache': 'error',
    '@edge-lint/valid-expression': 'error',
    '@edge-lint/no-unknown-tag': 'warn',
    '@edge-lint/mustache-spacing': ['warn', 'always'],
  },
};

