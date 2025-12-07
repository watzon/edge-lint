/**
 * SourceCode - Wrapper around tokens and source text
 *
 * Provides navigation utilities for rules to traverse and inspect
 * the Edge template structure.
 */

import type { Token } from 'edge-lexer/types';
import type {
  TagToken,
  AnyToken,
  SourceCode as ISourceCode,
} from './types/index.js';

export interface SourceCodeOptions {
  /** Original source text */
  text: string;
  /** Tokens from edge-lexer */
  tokens: Token[];
  /** Filename being linted */
  filename: string;
}

export class SourceCode implements ISourceCode {
  readonly text: string;
  readonly lines: string[];
  readonly tokens: Token[];
  readonly filename: string;

  private readonly _lineStartIndices: number[];
  private readonly _parentMap: WeakMap<AnyToken, TagToken | null>;

  constructor(options: SourceCodeOptions) {
    this.text = options.text;
    this.tokens = options.tokens;
    this.filename = options.filename;
    this.lines = this.text.split(/\r?\n/);
    this._lineStartIndices = this._computeLineStartIndices();
    this._parentMap = new WeakMap();
    this._buildParentMap(this.tokens, null);
  }

  /**
   * Get source text, optionally for a specific token with surrounding context
   */
  getText(token?: AnyToken, beforeCount = 0, afterCount = 0): string {
    if (!token) return this.text;

    const range = this.getRange(token);
    if (!range) return '';

    return this.text.slice(
      Math.max(0, range[0] - beforeCount),
      Math.min(this.text.length, range[1] + afterCount)
    );
  }

  /**
   * Get all source lines
   */
  getLines(): string[] {
    return this.lines;
  }

  /**
   * Get all tokens
   */
  getAllTokens(): Token[] {
    return this.tokens;
  }

  /**
   * Get tokens of a specific type
   */
  getTokensByType(type: string): Token[] {
    return this._collectTokens(this.tokens, (t) => t.type === type);
  }

  /**
   * Get the byte range [start, end] of a token in source
   */
  getRange(token: AnyToken): [number, number] | null {
    // Handle tokens with loc property (tag, mustache, comment)
    if ('loc' in token && token.loc) {
      const loc = token.loc as { start: { line: number; col: number }; end: { line: number; col: number } };
      let start = this.getIndexFromLoc(loc.start);
      const end = this.getIndexFromLoc(loc.end);

      // Edge lexer loc excludes opening delimiters, so adjust for them
      const type = token.type as string;
      if (type === 'mustache' || type === 'e__mustache') {
        // Regular mustache {{ }} - opening braces are 2 chars
        start -= 2;
      } else if (type === 's__mustache' || type === 'es__mustache') {
        // Safe mustache {{{ }}} - opening braces are 3 chars
        start -= 3;
      } else if (type === 'tag' || type === 'e__tag') {
        // Tags @name() - opening @ is 1 char, but loc starts at jsArg
        // We need to include @tagName( which is variable length
        const tagName = (token.properties as { name?: string })?.name ?? '';
        // @name( = 1 + tagName.length + 1 = tagName.length + 2
        start -= tagName.length + 2;
      }

      return [start, end];
    }

    // Handle raw tokens (have line and value)
    if ('line' in token && 'value' in token) {
      const rawToken = token as { line: number; value: string };
      const lineIndex = rawToken.line - 1;
      if (lineIndex < 0 || lineIndex >= this.lines.length) return null;

      const lineStart = this._lineStartIndices[lineIndex] ?? 0;
      const lineText = this.lines[lineIndex] ?? '';
      const col = lineText.indexOf(rawToken.value);
      const start = lineStart + Math.max(0, col);
      return [start, start + rawToken.value.length];
    }

    // Handle newline tokens
    if ('line' in token && token.type === 'newline') {
      const newlineToken = token as { line: number };
      const lineIndex = newlineToken.line - 1;
      if (lineIndex < 0 || lineIndex >= this._lineStartIndices.length) return null;

      const lineStart = this._lineStartIndices[lineIndex] ?? 0;
      const lineLength = this.lines[lineIndex]?.length ?? 0;
      return [lineStart + lineLength, lineStart + lineLength + 1];
    }

    return null;
  }

  /**
   * Convert location to source byte index
   */
  getIndexFromLoc(loc: { line: number; col: number }): number {
    const lineIndex = loc.line - 1;
    if (lineIndex < 0) return loc.col;
    if (lineIndex >= this._lineStartIndices.length) {
      return this.text.length;
    }
    const lineStart = this._lineStartIndices[lineIndex] ?? 0;
    return lineStart + loc.col;
  }

  /**
   * Convert source byte index to location
   */
  getLocFromIndex(index: number): { line: number; column: number } {
    for (let i = this._lineStartIndices.length - 1; i >= 0; i--) {
      const lineStart = this._lineStartIndices[i];
      if (lineStart !== undefined && index >= lineStart) {
        return {
          line: i + 1,
          column: index - lineStart,
        };
      }
    }
    return { line: 1, column: index };
  }

  /**
   * Get children of a tag token
   */
  getChildren(tag: TagToken): Token[] {
    return tag.children ?? [];
  }

  /**
   * Get the parent tag of a token (if any)
   */
  getParent(token: AnyToken): TagToken | null {
    return this._parentMap.get(token) ?? null;
  }

  /**
   * Get all ancestors of a token (from root to immediate parent)
   */
  getAncestors(token: AnyToken): TagToken[] {
    const ancestors: TagToken[] = [];
    let current = this.getParent(token);
    while (current) {
      ancestors.unshift(current);
      current = this.getParent(current);
    }
    return ancestors;
  }

  /**
   * Get a specific line by 1-indexed line number
   */
  getLine(lineNumber: number): string | undefined {
    return this.lines[lineNumber - 1];
  }

  /**
   * Get the number of lines in the source
   */
  getLineCount(): number {
    return this.lines.length;
  }

  /**
   * Compute byte indices where each line starts
   */
  private _computeLineStartIndices(): number[] {
    const indices = [0];
    for (let i = 0; i < this.text.length; i++) {
      if (this.text[i] === '\n') {
        indices.push(i + 1);
      }
    }
    return indices;
  }

  /**
   * Build parent map for all tokens
   */
  private _buildParentMap(tokens: AnyToken[], parent: TagToken | null): void {
    for (const token of tokens) {
      this._parentMap.set(token, parent);

      if ('children' in token && Array.isArray(token.children)) {
        this._buildParentMap(token.children, token as TagToken);
      }
    }
  }

  /**
   * Recursively collect tokens matching a predicate
   */
  private _collectTokens(
    tokens: Token[],
    predicate: (t: Token) => boolean
  ): Token[] {
    const result: Token[] = [];
    for (const token of tokens) {
      if (predicate(token)) {
        result.push(token);
      }
      if ('children' in token && Array.isArray(token.children)) {
        result.push(...this._collectTokens(token.children, predicate));
      }
    }
    return result;
  }
}
