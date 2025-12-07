/**
 * CLI type definitions
 */

import type { LintResult } from '@edge-lint/core';

export interface CLIOptions {
  /** Files or patterns to lint */
  patterns: string[];
  /** Fix issues automatically */
  fix?: boolean;
  /** Output format */
  format?: 'stylish' | 'json' | 'compact';
  /** Configuration file path */
  config?: string;
  /** Quiet mode (only errors) */
  quiet?: boolean;
  /** Maximum warnings before exit code 1 */
  maxWarnings?: number;
  /** Ignore patterns */
  ignore?: string[];
  /** Disable ignore patterns */
  noIgnore?: boolean;
  /** Output file for results */
  outputFile?: string;
  /** Enable debug output */
  debug?: boolean;
}

export interface Formatter {
  format(results: LintResult[], options?: FormatterOptions): string;
}

export interface FormatterOptions {
  /** Working directory for relative paths */
  cwd?: string;
  /** Show only errors (no warnings) */
  quiet?: boolean;
}
