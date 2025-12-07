/**
 * Linter - The main linting engine
 *
 * Coordinates tokenization, rule execution, and fix application.
 */

import { Tokenizer } from 'edge-lexer';
import type { Token, LexerTagDefinitionContract } from 'edge-lexer/types';
import { SourceCode } from './source-code.js';
import { RuleContext } from './rule-context.js';
import { applyFixes, getNonOverlappingFixes } from './fixer.js';
import type {
  Rule,
  LintMessage,
  LintResult,
  EdgeLintConfig,
  TokenVisitor,
  TagToken,
  MustacheToken,
  RawToken,
  CommentToken,
  NewLineToken,
  Severity,
  NormalizedSeverity,
  ParsedRuleConfig,
  Fix,
} from './types/index.js';
import { builtinRules } from './rules/index.js';

export interface LinterOptions {
  /** Initial configuration */
  config?: EdgeLintConfig;
}

export class Linter {
  private readonly _rules: Map<string, Rule>;
  private readonly _config: EdgeLintConfig;

  constructor(options: LinterOptions = {}) {
    this._config = options.config ?? {};
    this._rules = new Map(Object.entries(builtinRules));
  }

  /**
   * Register a custom rule
   */
  defineRule(ruleId: string, rule: Rule): void {
    this._rules.set(ruleId, rule);
  }

  /**
   * Get all registered rules
   */
  getRules(): Map<string, Rule> {
    return new Map(this._rules);
  }

  /**
   * Get a single rule by ID
   */
  getRule(ruleId: string): Rule | undefined {
    return this._rules.get(ruleId);
  }

  /**
   * Lint source code and return messages
   */
  verify(
    source: string,
    filename: string,
    config?: EdgeLintConfig
  ): LintMessage[] {
    const mergedConfig = this._mergeConfig(config);

    // Tokenize the source
    let tokens: Token[];
    const syntaxErrors: LintMessage[] = [];

    try {
      tokens = this._tokenize(source, filename, mergedConfig.parserOptions?.tags);
    } catch (error: unknown) {
      // Capture lexer errors as lint messages
      const err = error as { message?: string; line?: number; col?: number };
      syntaxErrors.push({
        ruleId: 'edge-syntax-error',
        severity: 2,
        message: err.message ?? 'Syntax error',
        line: err.line ?? 1,
        column: err.col ?? 0,
      });
      return syntaxErrors;
    }

    // Create SourceCode wrapper
    const sourceCode = new SourceCode({
      text: source,
      tokens,
      filename,
    });

    // Run rules
    const messages: LintMessage[] = [...syntaxErrors];

    for (const [ruleId, ruleConfig] of Object.entries(mergedConfig.rules ?? {})) {
      const rule = this._rules.get(ruleId);
      if (!rule) continue;

      const { severity, options } = this._parseRuleConfig(ruleConfig);
      if (severity === 0) continue;

      const context = new RuleContext({
        ruleId,
        severity: severity as 1 | 2,
        options,
        sourceCode,
        filename,
        settings: mergedConfig.settings ?? {},
        parserOptions: mergedConfig.parserOptions ?? {},
        messages: rule.meta.messages,
      });

      try {
        const visitor = rule.create(context);
        this._traverse(tokens, visitor);
        messages.push(...context.getMessages());
      } catch (error: unknown) {
        const err = error as { message?: string };
        messages.push({
          ruleId,
          severity: 2,
          message: `Rule "${ruleId}" threw an error: ${err.message ?? 'Unknown error'}`,
          line: 1,
          column: 0,
        });
      }
    }

    // Sort messages by location
    return messages.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      return a.column - b.column;
    });
  }

  /**
   * Lint source code and apply fixes
   */
  verifyAndFix(
    source: string,
    filename: string,
    config?: EdgeLintConfig
  ): LintResult {
    const MAX_ITERATIONS = 10;
    let currentSource = source;
    let messages: LintMessage[] = [];
    let fixed = false;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      messages = this.verify(currentSource, filename, config);

      const fixableMessages = messages.filter((m) => m.fix);
      if (fixableMessages.length === 0) break;

      // Get non-overlapping fixes
      const fixes = getNonOverlappingFixes(
        fixableMessages.map((m) => m.fix).filter((f): f is Fix => f !== undefined)
      );
      if (fixes.length === 0) break;

      fixed = true;
      currentSource = applyFixes(currentSource, fixes);
    }

    // Final verification after all fixes
    if (fixed) {
      messages = this.verify(currentSource, filename, config);
    }

    return {
      filename,
      messages,
      errorCount: messages.filter((m) => m.severity === 2).length,
      warningCount: messages.filter((m) => m.severity === 1).length,
      fixableErrorCount: messages.filter((m) => m.severity === 2 && m.fix).length,
      fixableWarningCount: messages.filter((m) => m.severity === 1 && m.fix).length,
      source,
      output: fixed ? currentSource : undefined,
    };
  }

  /**
   * Tokenize source using edge-lexer
   */
  private _tokenize(
    source: string,
    filename: string,
    tags?: Record<string, { block: boolean; seekable: boolean }>
  ): Token[] {
    // Convert our tag format to edge-lexer's format
    const lexerTags: Record<string, LexerTagDefinitionContract> = {};
    if (tags) {
      for (const [name, def] of Object.entries(tags)) {
        lexerTags[name] = {
          block: def.block,
          seekable: def.seekable,
        };
      }
    }

    // Add default Edge.js v6 tags
    const defaultTags: Record<string, LexerTagDefinitionContract> = {
      if: { block: true, seekable: true },
      elseif: { block: false, seekable: true },
      else: { block: false, seekable: false },
      unless: { block: true, seekable: true },
      each: { block: true, seekable: true },
      let: { block: false, seekable: true },
      assign: { block: false, seekable: true },
      include: { block: false, seekable: true },
      includeIf: { block: false, seekable: true },
      component: { block: true, seekable: true },
      slot: { block: true, seekable: true },
      inject: { block: false, seekable: true },
      debugger: { block: false, seekable: false },
      svg: { block: false, seekable: true },
      entryPointStyles: { block: false, seekable: true },
      entryPointScripts: { block: false, seekable: true },
      vite: { block: false, seekable: true },
      // Removed in v6 but still need to tokenize for error reporting:
      section: { block: true, seekable: true },
      yield: { block: false, seekable: true },
      super: { block: false, seekable: false },
      layout: { block: false, seekable: true },
      set: { block: false, seekable: true },
    };

    const allTags = { ...defaultTags, ...lexerTags };

    const tokenizer = new Tokenizer(source, allTags, { filename });
    tokenizer.parse();
    return tokenizer.tokens;
  }

  /**
   * Traverse tokens and call visitor handlers
   */
  private _traverse(tokens: Token[], visitor: TokenVisitor): void {
    // Call Program handler
    visitor.Program?.(tokens);

    // Traverse tokens
    this._visitTokens(tokens, visitor);

    // Call Program:exit handler
    visitor['Program:exit']?.(tokens);
  }

  /**
   * Visit an array of tokens
   */
  private _visitTokens(tokens: Token[], visitor: TokenVisitor): void {
    for (const token of tokens) {
      this._visitToken(token, visitor);
    }
  }

  /**
   * Visit a single token and dispatch to appropriate handler
   */
  private _visitToken(token: Token, visitor: TokenVisitor): void {
    switch (token.type) {
      case 'tag':
        visitor.Tag?.(token as unknown as TagToken);
        if ('children' in token && Array.isArray(token.children)) {
          this._visitTokens(token.children, visitor);
        }
        visitor['Tag:exit']?.(token as unknown as TagToken);
        break;

      case 'e__tag':
        visitor.EscapedTag?.(token as unknown as TagToken);
        break;

      case 'mustache':
        visitor.Mustache?.(token as unknown as MustacheToken);
        break;

      case 's__mustache':
        visitor.SafeMustache?.(token as unknown as MustacheToken);
        break;

      case 'e__mustache':
        visitor.EscapedMustache?.(token as unknown as MustacheToken);
        break;

      case 'es__mustache':
        visitor.EscapedSafeMustache?.(token as unknown as MustacheToken);
        break;

      case 'raw':
        visitor.Raw?.(token as unknown as RawToken);
        break;

      case 'comment':
        visitor.Comment?.(token as unknown as CommentToken);
        break;

      case 'newline':
        visitor.NewLine?.(token as unknown as NewLineToken);
        break;
    }
  }

  /**
   * Merge configurations
   */
  private _mergeConfig(config?: EdgeLintConfig): EdgeLintConfig {
    return {
      rules: { ...this._config.rules, ...config?.rules },
      settings: { ...this._config.settings, ...config?.settings },
      parserOptions: {
        ...this._config.parserOptions,
        ...config?.parserOptions,
        tags: {
          ...this._config.parserOptions?.tags,
          ...config?.parserOptions?.tags,
        },
      },
      ignorePatterns: [
        ...(this._config.ignorePatterns ?? []),
        ...(config?.ignorePatterns ?? []),
      ],
    };
  }

  /**
   * Parse rule configuration into severity and options
   */
  private _parseRuleConfig(config: Severity | [Severity, ...unknown[]]): ParsedRuleConfig {
    if (Array.isArray(config)) {
      const [severity, ...options] = config;
      return {
        severity: this._normalizeSeverity(severity),
        options,
      };
    }
    return {
      severity: this._normalizeSeverity(config),
      options: [],
    };
  }

  /**
   * Normalize severity to numeric value
   */
  private _normalizeSeverity(severity: Severity): NormalizedSeverity {
    if (typeof severity === 'number') {
      return severity as NormalizedSeverity;
    }
    switch (severity) {
      case 'off':
        return 0;
      case 'warn':
        return 1;
      case 'error':
        return 2;
      default:
        return 0;
    }
  }
}
