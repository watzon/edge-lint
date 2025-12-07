/**
 * Rule registry - exports all built-in rules
 */

import type { Rule } from '../types/index.js';

// Syntax rules
import { noEmptyMustache } from './syntax/no-empty-mustache.js';
import { validExpression } from './syntax/valid-expression.js';
import { noUnknownTag } from './syntax/no-unknown-tag.js';
import { noRemovedTags } from './syntax/no-removed-tags.js';
import { noDeprecatedHelpers } from './syntax/no-deprecated-helpers.js';
import { noDeprecatedPropsApi } from './syntax/no-deprecated-props-api.js';
import { noInlineBlockTags } from './syntax/no-inline-block-tags.js';
import { noSpaceBeforeTagArgs } from './syntax/no-space-before-tag-args.js';
import { validEachSyntax } from './syntax/valid-each-syntax.js';
import { noReservedVariableNames } from './syntax/no-reserved-variable-names.js';
import { noInvalidEndTag } from './syntax/no-invalid-end-tag.js';
import { noMismatchedCurlyBraces } from './syntax/no-mismatched-curly-braces.js';
import { noMultipleElse } from './syntax/no-multiple-else.js';
import { validViteTag } from './syntax/valid-vite-tag.js';
import { validEntrypointTags } from './syntax/valid-entrypoint-tags.js';

// Best practice rules
import { noUnusedLet } from './best-practices/no-unused-let.js';
import { preferSafeMustache } from './best-practices/prefer-safe-mustache.js';
import { requireSlotAwait } from './best-practices/require-slot-await.js';
import { noUndefinedSlot } from './best-practices/no-undefined-slot.js';
import { preferUnlessOverNegatedIf } from './best-practices/prefer-unless-over-negated-if.js';
import { noAssignWithoutLet } from './best-practices/no-assign-without-let.js';
import { preferIncludeIf } from './best-practices/prefer-include-if.js';
import { noRawHtmlInMustache } from './best-practices/no-raw-html-in-mustache.js';
import { requirePropsDefaults } from './best-practices/require-props-defaults.js';
import { eachElseOnEmpty } from './best-practices/each-else-on-empty.js';
import { preferStackPushOnce } from './best-practices/prefer-stack-push-once.js';

// Style rules
import { mustacheSpacing } from './style/mustache-spacing.js';
import { preferComponentTags } from './style/prefer-component-tags.js';
import { consistentSlotNaming } from './style/consistent-slot-naming.js';

/**
 * All built-in rules
 */
export const builtinRules: Record<string, Rule> = {
  // Syntax
  'no-empty-mustache': noEmptyMustache,
  'valid-expression': validExpression,
  'no-unknown-tag': noUnknownTag,
  'no-removed-tags': noRemovedTags,
  'no-deprecated-helpers': noDeprecatedHelpers,
  'no-deprecated-props-api': noDeprecatedPropsApi,
  'no-inline-block-tags': noInlineBlockTags,
  'no-space-before-tag-args': noSpaceBeforeTagArgs,
  'valid-each-syntax': validEachSyntax,
  'no-reserved-variable-names': noReservedVariableNames,
  'no-invalid-end-tag': noInvalidEndTag,
  'no-mismatched-curly-braces': noMismatchedCurlyBraces,
  'no-multiple-else': noMultipleElse,
  'valid-vite-tag': validViteTag,
  'valid-entrypoint-tags': validEntrypointTags,

  // Best practices
  'no-unused-let': noUnusedLet,
  'prefer-safe-mustache': preferSafeMustache,
  'require-slot-await': requireSlotAwait,
  'no-undefined-slot': noUndefinedSlot,
  'prefer-unless-over-negated-if': preferUnlessOverNegatedIf,
  'no-assign-without-let': noAssignWithoutLet,
  'prefer-include-if': preferIncludeIf,
  'no-raw-html-in-mustache': noRawHtmlInMustache,
  'require-props-defaults': requirePropsDefaults,
  'each-else-on-empty': eachElseOnEmpty,
  'prefer-stack-push-once': preferStackPushOnce,

  // Style
  'mustache-spacing': mustacheSpacing,
  'prefer-component-tags': preferComponentTags,
  'consistent-slot-naming': consistentSlotNaming,
};

/**
 * Recommended configuration
 * Only enable rules that are clearly necessary and low-noise
 */
export const recommendedConfig: Record<string, 'error' | 'warn' | 'off'> = {
  // Syntax - errors that will likely cause runtime issues
  'no-empty-mustache': 'error',
  'valid-expression': 'error',
  'no-unknown-tag': 'warn',
  'no-removed-tags': 'error',
  'no-deprecated-helpers': 'error',
  'no-deprecated-props-api': 'error',
  'no-inline-block-tags': 'error',
  'no-space-before-tag-args': 'error',
  'valid-each-syntax': 'error',
  'no-reserved-variable-names': 'error',
  'no-invalid-end-tag': 'error',
  'no-mismatched-curly-braces': 'error',
  'no-multiple-else': 'error',
  'valid-vite-tag': 'off', // AdonisJS-specific
  'valid-entrypoint-tags': 'off', // AdonisJS-specific

  // Best practices - recommended but not required
  'no-unused-let': 'warn',
  'prefer-safe-mustache': 'off',
  'require-slot-await': 'warn',
  'no-undefined-slot': 'off', // Can be noisy
  'prefer-unless-over-negated-if': 'off',
  'no-assign-without-let': 'warn',
  'prefer-include-if': 'off',
  'no-raw-html-in-mustache': 'off', // Can be noisy
  'require-props-defaults': 'off',
  'each-else-on-empty': 'off',
  'prefer-stack-push-once': 'off',

  // Style - off by default
  'mustache-spacing': 'off',
  'prefer-component-tags': 'off',
  'consistent-slot-naming': 'off',
};

/**
 * Strict configuration - all sensible rules enabled
 */
export const strictConfig: Record<string, 'error' | 'warn' | 'off'> = {
  // Syntax - all errors
  'no-empty-mustache': 'error',
  'valid-expression': 'error',
  'no-unknown-tag': 'error',
  'no-removed-tags': 'error',
  'no-deprecated-helpers': 'error',
  'no-deprecated-props-api': 'error',
  'no-inline-block-tags': 'error',
  'no-space-before-tag-args': 'error',
  'valid-each-syntax': 'error',
  'no-reserved-variable-names': 'error',
  'no-invalid-end-tag': 'error',
  'no-mismatched-curly-braces': 'error',
  'no-multiple-else': 'error',
  'valid-vite-tag': 'warn', // Enable for AdonisJS
  'valid-entrypoint-tags': 'warn', // Enable for AdonisJS

  // Best practices - all enabled
  'no-unused-let': 'error',
  'prefer-safe-mustache': 'warn',
  'require-slot-await': 'error',
  'no-undefined-slot': 'warn',
  'prefer-unless-over-negated-if': 'warn',
  'no-assign-without-let': 'error',
  'prefer-include-if': 'warn',
  'no-raw-html-in-mustache': 'warn',
  'require-props-defaults': 'warn',
  'each-else-on-empty': 'warn',
  'prefer-stack-push-once': 'warn',

  // Style - warnings
  'mustache-spacing': 'warn',
  'prefer-component-tags': 'warn',
  'consistent-slot-naming': 'warn',
};

/**
 * All rules enabled configuration (for testing/completeness)
 */
export const allConfig: Record<string, 'error' | 'warn' | 'off'> = {
  // Syntax
  'no-empty-mustache': 'error',
  'valid-expression': 'error',
  'no-unknown-tag': 'error',
  'no-removed-tags': 'error',
  'no-deprecated-helpers': 'error',
  'no-deprecated-props-api': 'error',
  'no-inline-block-tags': 'error',
  'no-space-before-tag-args': 'error',
  'valid-each-syntax': 'error',
  'no-reserved-variable-names': 'error',
  'no-invalid-end-tag': 'error',
  'no-mismatched-curly-braces': 'error',
  'no-multiple-else': 'error',
  'valid-vite-tag': 'error',
  'valid-entrypoint-tags': 'error',

  // Best practices
  'no-unused-let': 'error',
  'prefer-safe-mustache': 'warn',
  'require-slot-await': 'error',
  'no-undefined-slot': 'warn',
  'prefer-unless-over-negated-if': 'warn',
  'no-assign-without-let': 'error',
  'prefer-include-if': 'warn',
  'no-raw-html-in-mustache': 'warn',
  'require-props-defaults': 'warn',
  'each-else-on-empty': 'warn',
  'prefer-stack-push-once': 'warn',

  // Style
  'mustache-spacing': 'warn',
  'prefer-component-tags': 'warn',
  'consistent-slot-naming': 'warn',
};
