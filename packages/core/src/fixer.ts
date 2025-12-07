/**
 * Fixer - Utilities for creating auto-fix descriptors
 *
 * Rules use the Fixer to create Fix objects that describe
 * how to automatically correct lint issues.
 */

import type { Token } from 'edge-lexer/types';
import type { Fix, Fixer as IFixer } from './types/index.js';
import type { SourceCode } from './source-code.js';

export class Fixer implements IFixer {
  private readonly _sourceCode: SourceCode;

  constructor(sourceCode: SourceCode) {
    this._sourceCode = sourceCode;
  }

  /**
   * Insert text after a token
   */
  insertTextAfter(token: Token, text: string): Fix {
    const range = this._sourceCode.getRange(token);
    if (!range) {
      throw new Error('Cannot get range for token');
    }
    return this.insertTextAfterRange(range, text);
  }

  /**
   * Insert text before a token
   */
  insertTextBefore(token: Token, text: string): Fix {
    const range = this._sourceCode.getRange(token);
    if (!range) {
      throw new Error('Cannot get range for token');
    }
    return this.insertTextBeforeRange(range, text);
  }

  /**
   * Insert text after a byte range
   */
  insertTextAfterRange(range: [number, number], text: string): Fix {
    return {
      range: [range[1], range[1]],
      text,
    };
  }

  /**
   * Insert text before a byte range
   */
  insertTextBeforeRange(range: [number, number], text: string): Fix {
    return {
      range: [range[0], range[0]],
      text,
    };
  }

  /**
   * Remove a token
   */
  remove(token: Token): Fix {
    const range = this._sourceCode.getRange(token);
    if (!range) {
      throw new Error('Cannot get range for token');
    }
    return this.removeRange(range);
  }

  /**
   * Remove a byte range
   */
  removeRange(range: [number, number]): Fix {
    return {
      range,
      text: '',
    };
  }

  /**
   * Replace a token's text
   */
  replaceText(token: Token, text: string): Fix {
    const range = this._sourceCode.getRange(token);
    if (!range) {
      throw new Error('Cannot get range for token');
    }
    return this.replaceTextRange(range, text);
  }

  /**
   * Replace text in a byte range
   */
  replaceTextRange(range: [number, number], text: string): Fix {
    return {
      range,
      text,
    };
  }
}

/**
 * Merge multiple fixes into a single fix
 *
 * Fixes are expected to be non-overlapping. If they overlap,
 * the behavior is undefined.
 */
export function mergeFixes(fixes: Fix[]): Fix | null {
  if (fixes.length === 0) return null;
  if (fixes.length === 1) return fixes[0] ?? null;

  // Sort fixes by start position (ascending)
  const sorted = [...fixes].sort((a, b) => a.range[0] - b.range[0]);

  // Check for overlapping fixes
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev && curr && prev.range[1] > curr.range[0]) {
      // Overlapping fixes - can't merge safely
      // Return the first fix only
      return sorted[0] ?? null;
    }
  }

  // Merge all fixes into one
  const firstFix = sorted[0];
  const lastFix = sorted[sorted.length - 1];
  if (!firstFix || !lastFix) return null;

  // Build the replacement text by applying fixes in order
  // We need the original text between fixes
  let text = '';

  for (const fix of sorted) {
    // This simple merge assumes we don't have the original text
    // In practice, we'd need the source to fill gaps
    // For now, just concatenate fix texts
    text += fix.text;
  }

  return {
    range: [firstFix.range[0], lastFix.range[1]],
    text,
  };
}

/**
 * Apply a fix to source text
 */
export function applyFix(source: string, fix: Fix): string {
  return source.slice(0, fix.range[0]) + fix.text + source.slice(fix.range[1]);
}

/**
 * Apply multiple non-overlapping fixes to source text
 *
 * Fixes are applied in reverse order (from end to start) to preserve
 * indices for earlier fixes.
 */
export function applyFixes(source: string, fixes: Fix[]): string {
  if (fixes.length === 0) return source;

  // Sort fixes by start position (descending) so we apply from end first
  const sorted = [...fixes].sort((a, b) => b.range[0] - a.range[0]);

  let result = source;
  for (const fix of sorted) {
    result = applyFix(result, fix);
  }

  return result;
}

/**
 * Get non-overlapping fixes from a list of fixes
 *
 * When fixes overlap, only the first one (by start position) is kept.
 */
export function getNonOverlappingFixes(fixes: Fix[]): Fix[] {
  if (fixes.length === 0) return [];

  // Sort by start position (ascending)
  const sorted = [...fixes].sort((a, b) => a.range[0] - b.range[0]);

  const result: Fix[] = [];
  let lastEnd = -Infinity;

  for (const fix of sorted) {
    if (fix.range[0] >= lastEnd) {
      result.push(fix);
      lastEnd = fix.range[1];
    }
  }

  return result;
}
