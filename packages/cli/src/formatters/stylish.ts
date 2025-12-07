/**
 * Stylish formatter - colorful, readable output
 */

import chalk from 'chalk';
import path from 'node:path';
import type { LintResult, LintMessage } from '@edge-lint/core';
import type { Formatter, FormatterOptions } from '../types.js';

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

function formatMessage(message: LintMessage): string {
  const severity = message.severity === 2
    ? chalk.red('error')
    : chalk.yellow('warning');

  const location = chalk.dim(`${message.line}:${message.column}`);
  const ruleId = chalk.dim(message.ruleId);

  return `  ${location}  ${severity}  ${message.message}  ${ruleId}`;
}

export const stylish: Formatter = {
  format(results: LintResult[], options: FormatterOptions = {}): string {
    const cwd = options.cwd ?? process.cwd();
    const quiet = options.quiet ?? false;

    let totalErrors = 0;
    let totalWarnings = 0;
    let totalFixable = 0;
    const output: string[] = [];

    for (const result of results) {
      const messages = quiet
        ? result.messages.filter(m => m.severity === 2)
        : result.messages;

      if (messages.length === 0) continue;

      // File path
      const relativePath = path.relative(cwd, result.filename);
      output.push('');
      output.push(chalk.underline(relativePath));

      // Messages
      for (const message of messages) {
        output.push(formatMessage(message));

        if (message.severity === 2) {
          totalErrors++;
        } else {
          totalWarnings++;
        }

        if (message.fix) {
          totalFixable++;
        }
      }
    }

    // Summary
    if (totalErrors > 0 || totalWarnings > 0) {
      output.push('');

      const parts: string[] = [];
      if (totalErrors > 0) {
        parts.push(chalk.red.bold(`${totalErrors} ${pluralize('error', totalErrors)}`));
      }
      if (totalWarnings > 0) {
        parts.push(chalk.yellow.bold(`${totalWarnings} ${pluralize('warning', totalWarnings)}`));
      }

      output.push(`✖ ${parts.join(' and ')}`);

      if (totalFixable > 0) {
        output.push(chalk.dim(`  ${totalFixable} ${pluralize('issue', totalFixable)} potentially fixable with --fix`));
      }
    }

    return output.join('\n');
  },
};
