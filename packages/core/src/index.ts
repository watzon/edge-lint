/**
 * @edge-lint/core
 *
 * Core linting engine for Edge.js templates.
 */

// Main classes
export { Linter, type LinterOptions } from './linter.js';
export { SourceCode, type SourceCodeOptions } from './source-code.js';
export { RuleContext, type RuleContextOptions } from './rule-context.js';
export { Fixer, applyFix, applyFixes, mergeFixes, getNonOverlappingFixes } from './fixer.js';

// Types
export type {
  // Severity and config
  Severity,
  RuleConfig,
  EdgeLintConfig,
  ParserOptions,
  NormalizedSeverity,
  ParsedRuleConfig,

  // Rules
  Rule,
  RuleMeta,
  TokenVisitor,

  // Context
  RuleContext as IRuleContext,
  ReportDescriptor,
  SuggestionDescriptor,
  Fixer as IFixer,

  // Messages and results
  LintMessage,
  LintResult,
  Fix,
  Suggestion,

  // Locations
  Position,
  SourceLocation,

  // Tokens
  LexerToken,
  EdgeToken,
  TagToken,
  MustacheToken,
  RawToken,
  CommentToken,
  NewLineToken,

  // SourceCode interface
  SourceCode as ISourceCode,
} from './types/index.js';

// Rules
export { builtinRules, recommendedConfig, allConfig } from './rules/index.js';

// Individual rules (for direct access)
export { noEmptyMustache } from './rules/syntax/no-empty-mustache.js';
export { validExpression } from './rules/syntax/valid-expression.js';
export { noUnknownTag } from './rules/syntax/no-unknown-tag.js';
export { noRemovedTags } from './rules/syntax/no-removed-tags.js';
export { noDeprecatedHelpers } from './rules/syntax/no-deprecated-helpers.js';
export { noDeprecatedPropsApi } from './rules/syntax/no-deprecated-props-api.js';
export { noInlineBlockTags } from './rules/syntax/no-inline-block-tags.js';
export { noUnusedLet } from './rules/best-practices/no-unused-let.js';
export { preferSafeMustache } from './rules/best-practices/prefer-safe-mustache.js';
export { mustacheSpacing } from './rules/style/mustache-spacing.js';
