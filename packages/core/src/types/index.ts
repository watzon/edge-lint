/**
 * Core type definitions for @edge-lint/core
 */

import type { Token as LexerToken } from 'edge-lexer/types';

// Re-export lexer types for convenience
export type { Token as LexerToken } from 'edge-lexer/types';

/**
 * Generic token interface that both our types and edge-lexer tokens satisfy
 * Used for SourceCode methods that need to work with any token
 */
export interface AnyToken {
  type: string;
  filename?: string;
  loc?: {
    start: { line: number; col: number };
    end: { line: number; col: number };
  };
  line?: number;
  value?: string;
  properties?: {
    name?: string;
    jsArg?: string;
    selfclosed?: boolean;
  };
  children?: AnyToken[];
}

/**
 * Severity levels for lint messages
 * - 'off' or 0: Rule is disabled
 * - 'warn' or 1: Rule produces a warning
 * - 'error' or 2: Rule produces an error
 */
export type Severity = 'off' | 'warn' | 'error' | 0 | 1 | 2;

/**
 * Rule configuration can be:
 * - A severity level
 * - An array with severity and options
 */
export type RuleConfig = Severity | [Severity, ...unknown[]];

/**
 * Location information for source positions
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * Location range in source code
 */
export interface SourceLocation {
  start: Position;
  end: Position;
}

/**
 * A fix descriptor for auto-fixing issues
 */
export interface Fix {
  /** Byte range [start, end] in source to replace */
  range: [number, number];
  /** Replacement text */
  text: string;
}

/**
 * A suggestion for manually fixing an issue
 */
export interface Suggestion {
  /** Description of what the suggestion does */
  desc: string;
  /** The fix to apply */
  fix: Fix;
}

/**
 * A lint message/diagnostic produced by a rule
 */
export interface LintMessage {
  /** The rule that produced this message */
  ruleId: string;
  /** Severity: 1 = warning, 2 = error */
  severity: 1 | 2;
  /** Human-readable message */
  message: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (0-indexed) */
  column: number;
  /** End line number (1-indexed) */
  endLine?: number | undefined;
  /** End column number (0-indexed) */
  endColumn?: number | undefined;
  /** Auto-fix for this issue */
  fix?: Fix | undefined;
  /** Manual fix suggestions */
  suggestions?: Suggestion[] | undefined;
}

/**
 * Result of linting a single file
 */
export interface LintResult {
  /** Absolute file path */
  filename: string;
  /** All lint messages */
  messages: LintMessage[];
  /** Number of error-level messages */
  errorCount: number;
  /** Number of warning-level messages */
  warningCount: number;
  /** Number of fixable errors */
  fixableErrorCount: number;
  /** Number of fixable warnings */
  fixableWarningCount: number;
  /** Original source code */
  source?: string | undefined;
  /** Fixed source code (if fixes were applied) */
  output?: string | undefined;
}

/**
 * Fixer interface for creating fixes
 */
export interface Fixer {
  /** Insert text after a token */
  insertTextAfter(token: LexerToken, text: string): Fix;
  /** Insert text before a token */
  insertTextBefore(token: LexerToken, text: string): Fix;
  /** Insert text after a byte range */
  insertTextAfterRange(range: [number, number], text: string): Fix;
  /** Insert text before a byte range */
  insertTextBeforeRange(range: [number, number], text: string): Fix;
  /** Remove a token */
  remove(token: LexerToken): Fix;
  /** Remove a byte range */
  removeRange(range: [number, number]): Fix;
  /** Replace a token's text */
  replaceText(token: LexerToken, text: string): Fix;
  /** Replace text in a byte range */
  replaceTextRange(range: [number, number], text: string): Fix;
}

/**
 * Suggestion descriptor for context.report()
 */
export interface SuggestionDescriptor {
  /** Description of the suggestion */
  desc: string;
  /** Message ID to use from rule.meta.messages */
  messageId?: string;
  /** Data for message interpolation */
  data?: Record<string, string>;
  /** Function to create the fix */
  fix: (fixer: Fixer) => Fix | Fix[] | null;
}

/**
 * A node that can be reported on (has location info)
 */
export interface ReportableNode {
  loc?: {
    start: { line: number; col: number };
    end: { line: number; col: number };
  };
  line?: number;
}

/**
 * Report descriptor for context.report()
 */
export interface ReportDescriptor {
  /** Token to report on (provides location) */
  node?: ReportableNode;
  /** Explicit location (overrides node location) */
  loc?: SourceLocation | { line: number; column: number };
  /** Message to display */
  message?: string;
  /** Message ID to use from rule.meta.messages */
  messageId?: string;
  /** Data for message interpolation ({{ key }} in message) */
  data?: Record<string, string>;
  /** Function to create an auto-fix */
  fix?: (fixer: Fixer) => Fix | Fix[] | null;
  /** Array of fix suggestions */
  suggest?: SuggestionDescriptor[];
}

/**
 * Rule metadata
 */
export interface RuleMeta {
  /** Rule type */
  type: 'problem' | 'suggestion' | 'layout';
  /** Documentation */
  docs: {
    /** Short description of the rule */
    description: string;
    /** Category for grouping */
    category: 'Syntax' | 'Best Practices' | 'Style';
    /** Whether included in recommended config */
    recommended?: boolean | 'error' | 'warn';
    /** URL to documentation */
    url?: string;
  };
  /** Whether rule provides fixes */
  fixable?: 'code' | 'whitespace';
  /** Whether rule provides suggestions */
  hasSuggestions?: boolean;
  /** JSON Schema for rule options */
  schema?: object[];
  /** Message templates (for messageId) */
  messages?: Record<string, string>;
  /** Whether rule is deprecated */
  deprecated?: boolean;
  /** Rules that replace this deprecated rule */
  replacedBy?: string[];
}

/**
 * Edge tag token - mirrors edge-lexer TagToken
 * We use our own interface to avoid enum type issues
 */
export interface TagToken {
  type: string; // 'tag' or 'e__tag'
  filename: string;
  loc: {
    start: { line: number; col: number };
    end: { line: number; col: number };
  };
  properties: {
    name: string;
    jsArg: string;
    selfclosed: boolean;
  };
  children: LexerToken[];
}

/**
 * Edge mustache token - mirrors edge-lexer MustacheToken
 */
export interface MustacheToken {
  type: string; // 'mustache', 's__mustache', 'e__mustache', 'es__mustache'
  filename: string;
  loc: {
    start: { line: number; col: number };
    end: { line: number; col: number };
  };
  properties: {
    jsArg: string;
  };
}

/**
 * Edge raw text token
 */
export interface RawToken {
  type: 'raw';
  filename: string;
  line: number;
  value: string;
}

/**
 * Edge comment token
 */
export interface CommentToken {
  type: 'comment';
  filename: string;
  loc: {
    start: { line: number; col: number };
    end: { line: number; col: number };
  };
  value: string;
}

/**
 * Edge newline token
 */
export interface NewLineToken {
  type: 'newline';
  filename: string;
  line: number;
}

/**
 * Union of all Edge token types
 */
export type EdgeToken =
  | TagToken
  | MustacheToken
  | RawToken
  | CommentToken
  | NewLineToken;

/**
 * Forward declaration of SourceCode (defined in source-code.ts)
 */
export interface SourceCode {
  /** Original source text */
  readonly text: string;
  /** Source split into lines */
  readonly lines: string[];
  /** All tokens from the lexer */
  readonly tokens: LexerToken[];
  /** Filename */
  readonly filename: string;

  /** Get source text, optionally for a specific token */
  getText(token?: AnyToken, beforeCount?: number, afterCount?: number): string;
  /** Get all source lines */
  getLines(): string[];
  /** Get all tokens */
  getAllTokens(): LexerToken[];
  /** Get tokens by type */
  getTokensByType(type: string): LexerToken[];
  /** Get byte range of a token */
  getRange(token: AnyToken): [number, number] | null;
  /** Convert location to byte index */
  getIndexFromLoc(loc: { line: number; col: number }): number;
  /** Convert byte index to location */
  getLocFromIndex(index: number): { line: number; column: number };
  /** Get children of a tag token */
  getChildren(tag: TagToken): LexerToken[];
  /** Get parent tag of a token */
  getParent(token: AnyToken): TagToken | null;
  /** Get all ancestors of a token */
  getAncestors(token: AnyToken): TagToken[];
}

/**
 * Forward declaration of RuleContext (defined in rule-context.ts)
 */
export interface RuleContext {
  /** Rule ID */
  readonly id: string;
  /** Rule options */
  readonly options: readonly unknown[];
  /** Global settings */
  readonly settings: Readonly<Record<string, unknown>>;
  /** Parser options */
  readonly parserOptions: Readonly<ParserOptions>;

  /** Get the source code object */
  getSourceCode(): SourceCode;
  /** Get the filename being linted */
  getFilename(): string;
  /** Get the physical filename */
  getPhysicalFilename(): string;
  /** Report a lint problem */
  report(descriptor: ReportDescriptor): void;
}

/**
 * Token visitor handlers - function signatures for each token type
 */
export type TokenVisitorHandler<T> = (token: T) => void;

/**
 * Token visitor - handlers for different token types
 */
export interface TokenVisitor {
  // Tag tokens
  Tag?: TokenVisitorHandler<TagToken>;
  'Tag:exit'?: TokenVisitorHandler<TagToken>;
  EscapedTag?: TokenVisitorHandler<TagToken>;

  // Mustache tokens
  Mustache?: TokenVisitorHandler<MustacheToken>;
  SafeMustache?: TokenVisitorHandler<MustacheToken>;
  EscapedMustache?: TokenVisitorHandler<MustacheToken>;
  EscapedSafeMustache?: TokenVisitorHandler<MustacheToken>;

  // Other tokens
  Raw?: TokenVisitorHandler<RawToken>;
  Comment?: TokenVisitorHandler<CommentToken>;
  NewLine?: TokenVisitorHandler<NewLineToken>;

  // Document-level
  Program?: (tokens: LexerToken[]) => void;
  'Program:exit'?: (tokens: LexerToken[]) => void;
}

/**
 * Rule definition
 */
export interface Rule {
  /** Rule metadata */
  meta: RuleMeta;
  /** Factory function that creates the visitor */
  create(context: RuleContext): TokenVisitor;
}

/**
 * Parser options
 */
export interface ParserOptions {
  /** Custom tags to register with the lexer */
  tags?: Record<
    string,
    {
      block: boolean;
      seekable: boolean;
    }
  >;
}

/**
 * Linter configuration
 */
export interface EdgeLintConfig {
  /** Configuration presets to extend */
  extends?: string | string[];
  /** Rule configurations */
  rules?: Record<string, RuleConfig>;
  /** Plugins to load */
  plugins?: string[];
  /** Global settings accessible to rules */
  settings?: Record<string, unknown>;
  /** Parser options */
  parserOptions?: ParserOptions;
  /** File patterns to ignore */
  ignorePatterns?: string[];
  /** Override configurations for specific files */
  overrides?: Array<{
    files: string | string[];
    excludedFiles?: string | string[];
    rules?: Record<string, RuleConfig>;
  }>;
}

/**
 * Normalized severity (numeric)
 */
export type NormalizedSeverity = 0 | 1 | 2;

/**
 * Parsed rule configuration
 */
export interface ParsedRuleConfig {
  severity: NormalizedSeverity;
  options: unknown[];
}
