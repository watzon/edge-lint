/**
 * RuleContext - The context object passed to rule create() functions
 *
 * Provides methods for rules to report issues and access source code.
 */

import type {
  ReportDescriptor,
  LintMessage,
  Fix,
  RuleContext as IRuleContext,
  ParserOptions,
  SuggestionDescriptor,
  Suggestion,
  ReportableNode,
} from './types/index.js';
import type { SourceCode } from './source-code.js';
import { Fixer, getNonOverlappingFixes } from './fixer.js';

export interface RuleContextOptions {
  /** Rule ID */
  ruleId: string;
  /** Severity (1 = warn, 2 = error) */
  severity: 1 | 2;
  /** Rule options from config */
  options: readonly unknown[];
  /** SourceCode wrapper */
  sourceCode: SourceCode;
  /** Filename being linted */
  filename: string;
  /** Global settings */
  settings: Readonly<Record<string, unknown>>;
  /** Parser options */
  parserOptions: Readonly<ParserOptions>;
  /** Message templates from rule meta */
  messages?: Record<string, string>;
}

export class RuleContext implements IRuleContext {
  readonly id: string;
  readonly options: readonly unknown[];
  readonly settings: Readonly<Record<string, unknown>>;
  readonly parserOptions: Readonly<ParserOptions>;

  private readonly _sourceCode: SourceCode;
  private readonly _filename: string;
  private readonly _severity: 1 | 2;
  private readonly _messages: LintMessage[] = [];
  private readonly _messageTemplates: Record<string, string>;

  constructor(options: RuleContextOptions) {
    this.id = options.ruleId;
    this.options = options.options;
    this.settings = options.settings;
    this.parserOptions = options.parserOptions;
    this._sourceCode = options.sourceCode;
    this._filename = options.filename;
    this._severity = options.severity;
    this._messageTemplates = options.messages ?? {};
  }

  /**
   * Get the source code object
   */
  getSourceCode(): SourceCode {
    return this._sourceCode;
  }

  /**
   * Get the filename being linted
   */
  getFilename(): string {
    return this._filename;
  }

  /**
   * Get the physical filename (same as filename for now)
   */
  getPhysicalFilename(): string {
    return this._filename;
  }

  /**
   * Report a lint problem
   */
  report(descriptor: ReportDescriptor): void {
    const { node, loc, message, messageId, data, fix, suggest } = descriptor;

    // Resolve location
    let location: {
      line: number;
      column: number;
      endLine?: number;
      endColumn?: number;
    };

    if (loc) {
      if ('start' in loc && 'end' in loc) {
        location = {
          line: loc.start.line,
          column: loc.start.column,
          endLine: loc.end.line,
          endColumn: loc.end.column,
        };
      } else {
        location = {
          line: loc.line,
          column: loc.column,
        };
      }
    } else if (node) {
      location = this._getLocationFromToken(node);
    } else {
      throw new Error('Report must have either node or loc');
    }

    // Resolve message
    let resolvedMessage: string;
    if (messageId) {
      const template = this._messageTemplates[messageId];
      if (!template) {
        throw new Error(`Unknown messageId: ${messageId}`);
      }
      resolvedMessage = this._formatMessage(template, data);
    } else if (message) {
      resolvedMessage = this._formatMessage(message, data);
    } else {
      throw new Error('Report must have either message or messageId');
    }

    // Create lint message
    const lintMessage: LintMessage = {
      ruleId: this.id,
      severity: this._severity,
      message: resolvedMessage,
      line: location.line,
      column: location.column,
      endLine: location.endLine,
      endColumn: location.endColumn,
    };

    // Process fix
    if (fix) {
      const fixer = new Fixer(this._sourceCode);
      try {
        const fixResult = fix(fixer);
        if (fixResult) {
          const fixes = Array.isArray(fixResult) ? fixResult : [fixResult];
          const nonOverlapping = getNonOverlappingFixes(fixes);
          if (nonOverlapping.length === 1 && nonOverlapping[0]) {
            lintMessage.fix = nonOverlapping[0];
          } else if (nonOverlapping.length > 1) {
            // Merge multiple fixes
            lintMessage.fix = this._mergeFixesForMessage(nonOverlapping);
          }
        }
      } catch {
        // Ignore fix errors
      }
    }

    // Process suggestions
    if (suggest && suggest.length > 0) {
      lintMessage.suggestions = this._processSuggestions(suggest);
    }

    this._messages.push(lintMessage);
  }

  /**
   * Get all collected messages
   */
  getMessages(): LintMessage[] {
    return this._messages;
  }

  /**
   * Get location from a token
   */
  private _getLocationFromToken(node: ReportableNode): {
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
  } {
    if (node.loc) {
      return {
        line: node.loc.start.line,
        column: node.loc.start.col,
        endLine: node.loc.end.line,
        endColumn: node.loc.end.col,
      };
    }

    if (node.line !== undefined) {
      return {
        line: node.line,
        column: 0,
      };
    }

    return { line: 1, column: 0 };
  }

  /**
   * Format a message template with data
   */
  private _formatMessage(
    template: string,
    data?: Record<string, string>
  ): string {
    if (!data) return template;

    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
      return data[key] ?? `{{${key}}}`;
    });
  }

  /**
   * Process suggestion descriptors into suggestions
   */
  private _processSuggestions(
    descriptors: SuggestionDescriptor[]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const descriptor of descriptors) {
      let desc: string;
      if (descriptor.messageId) {
        const template = this._messageTemplates[descriptor.messageId];
        if (!template) {
          throw new Error(`Unknown messageId: ${descriptor.messageId}`);
        }
        desc = this._formatMessage(template, descriptor.data);
      } else {
        desc = this._formatMessage(descriptor.desc, descriptor.data);
      }

      const fixer = new Fixer(this._sourceCode);
      try {
        const fixResult = descriptor.fix(fixer);
        if (fixResult) {
          const fixes = Array.isArray(fixResult) ? fixResult : [fixResult];
          const nonOverlapping = getNonOverlappingFixes(fixes);
          if (nonOverlapping.length >= 1) {
            const fix =
              nonOverlapping.length === 1 && nonOverlapping[0]
                ? nonOverlapping[0]
                : this._mergeFixesForMessage(nonOverlapping);
            if (fix) {
              suggestions.push({ desc, fix });
            }
          }
        }
      } catch {
        // Ignore fix errors
      }
    }

    return suggestions;
  }

  /**
   * Merge multiple fixes into one for a message
   */
  private _mergeFixesForMessage(fixes: Fix[]): Fix | undefined {
    if (fixes.length === 0) return undefined;
    if (fixes.length === 1) return fixes[0];

    // Sort by start position
    const sorted = [...fixes].sort((a, b) => a.range[0] - b.range[0]);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return undefined;

    // Build merged text by applying fixes to the original text
    const sourceText = this._sourceCode.text;
    let result = '';
    let lastEnd = first.range[0];

    for (const fix of sorted) {
      // Add original text between this fix and the previous one
      if (fix.range[0] > lastEnd) {
        result += sourceText.slice(lastEnd, fix.range[0]);
      }
      result += fix.text;
      lastEnd = fix.range[1];
    }

    return {
      range: [first.range[0], last.range[1]],
      text: result,
    };
  }
}
