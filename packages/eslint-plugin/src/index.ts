/**
 * @edge-lint/eslint-plugin
 *
 * ESLint plugin for Edge.js templates
 */

import type { Linter, ESLint } from 'eslint';
import { createAllRules } from './rules/index.js';
import { recommended, strict } from './configs/index.js';
import { processor } from './processor.js';
import * as parser from '@edge-lint/eslint-parser';

// Create all rules
const rules = createAllRules();

// Plugin metadata
const meta = {
  name: '@edge-lint/eslint-plugin',
  version: '0.1.0',
};

// Legacy configs (for eslintrc)
const configs: Record<string, Linter.Config> = {
  recommended,
  strict,
};

// Processors
const processors: Record<string, Linter.Processor> = {
  '.edge': processor,
};

// Plugin type
interface EdgeLintPlugin {
  meta: typeof meta;
  rules: typeof rules;
  configs: Record<string, Linter.Config>;
  processors: typeof processors;
}

// Create the plugin object
const plugin: EdgeLintPlugin = {
  meta,
  rules,
  configs,
  processors,
};

// Flat configs (self-referencing plugin)
const flatConfigs = {
  /**
   * Recommended flat config
   * Only enable rules that are clearly necessary and low-noise
   */
  'flat/recommended': {
    name: '@edge-lint/flat/recommended',
    files: ['**/*.edge'],
    plugins: {
      '@edge-lint': plugin as unknown as ESLint.Plugin,
    },
    languageOptions: {
      parser: parser as Linter.Parser,
    },
    rules: {
      // Syntax - errors that will likely cause runtime issues
      '@edge-lint/no-empty-mustache': 'error',
      '@edge-lint/valid-expression': 'error',
      '@edge-lint/no-unknown-tag': 'warn',
      '@edge-lint/no-removed-tags': 'error',
      '@edge-lint/no-deprecated-helpers': 'error',
      '@edge-lint/no-deprecated-props-api': 'error',
      '@edge-lint/no-inline-block-tags': 'error',
      '@edge-lint/no-space-before-tag-args': 'error',
      '@edge-lint/valid-each-syntax': 'error',
      '@edge-lint/no-reserved-variable-names': 'error',
      '@edge-lint/no-invalid-end-tag': 'error',
      '@edge-lint/no-mismatched-curly-braces': 'error',
      '@edge-lint/no-multiple-else': 'error',
      '@edge-lint/valid-vite-tag': 'off', // AdonisJS-specific
      '@edge-lint/valid-entrypoint-tags': 'off', // AdonisJS-specific

      // Best practices - recommended but not required
      '@edge-lint/no-unused-let': 'warn',
      '@edge-lint/prefer-safe-mustache': 'off',
      '@edge-lint/require-slot-await': 'warn',
      '@edge-lint/no-undefined-slot': 'off', // Can be noisy
      '@edge-lint/prefer-unless-over-negated-if': 'off',
      '@edge-lint/no-assign-without-let': 'warn',
      '@edge-lint/prefer-include-if': 'off',
      '@edge-lint/no-raw-html-in-mustache': 'off', // Can be noisy
      '@edge-lint/require-props-defaults': 'off',
      '@edge-lint/each-else-on-empty': 'off',
      '@edge-lint/prefer-stack-push-once': 'off',

      // Style - off by default
      '@edge-lint/mustache-spacing': 'off',
      '@edge-lint/prefer-component-tags': 'off',
      '@edge-lint/consistent-slot-naming': 'off',
    },
  } satisfies Linter.Config,

  /**
   * Strict flat config - all sensible rules enabled
   */
  'flat/strict': {
    name: '@edge-lint/flat/strict',
    files: ['**/*.edge'],
    plugins: {
      '@edge-lint': plugin as unknown as ESLint.Plugin,
    },
    languageOptions: {
      parser: parser as Linter.Parser,
    },
    rules: {
      // Syntax - all errors
      '@edge-lint/no-empty-mustache': 'error',
      '@edge-lint/valid-expression': 'error',
      '@edge-lint/no-unknown-tag': 'error',
      '@edge-lint/no-removed-tags': 'error',
      '@edge-lint/no-deprecated-helpers': 'error',
      '@edge-lint/no-deprecated-props-api': 'error',
      '@edge-lint/no-inline-block-tags': 'error',
      '@edge-lint/no-space-before-tag-args': 'error',
      '@edge-lint/valid-each-syntax': 'error',
      '@edge-lint/no-reserved-variable-names': 'error',
      '@edge-lint/no-invalid-end-tag': 'error',
      '@edge-lint/no-mismatched-curly-braces': 'error',
      '@edge-lint/no-multiple-else': 'error',
      '@edge-lint/valid-vite-tag': 'warn', // Enable for AdonisJS
      '@edge-lint/valid-entrypoint-tags': 'warn', // Enable for AdonisJS

      // Best practices - all enabled
      '@edge-lint/no-unused-let': 'error',
      '@edge-lint/prefer-safe-mustache': 'warn',
      '@edge-lint/require-slot-await': 'error',
      '@edge-lint/no-undefined-slot': 'warn',
      '@edge-lint/prefer-unless-over-negated-if': 'warn',
      '@edge-lint/no-assign-without-let': 'error',
      '@edge-lint/prefer-include-if': 'warn',
      '@edge-lint/no-raw-html-in-mustache': 'warn',
      '@edge-lint/require-props-defaults': 'warn',
      '@edge-lint/each-else-on-empty': 'warn',
      '@edge-lint/prefer-stack-push-once': 'warn',

      // Style - warnings
      '@edge-lint/mustache-spacing': 'warn',
      '@edge-lint/prefer-component-tags': 'warn',
      '@edge-lint/consistent-slot-naming': 'warn',
    },
  } satisfies Linter.Config,
};

// Add flat configs to the plugin
Object.assign(configs, flatConfigs);

// Export everything
export { rules, configs, processors, meta, parser };
export default plugin;
