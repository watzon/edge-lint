/**
 * Compact formatter - one line per message
 */

import path from 'node:path';
import type { LintResult } from '@edge-lint/core';
import type { Formatter, FormatterOptions } from '../types.js';

export const compact: Formatter = {
  format(results: LintResult[], options: FormatterOptions = {}): string {
    const cwd = options.cwd ?? process.cwd();
    const quiet = options.quiet ?? false;

    const output: string[] = [];

    for (const result of results) {
      const messages = quiet
        ? result.messages.filter(m => m.severity === 2)
        : result.messages;

      const relativePath = path.relative(cwd, result.filename);

      for (const message of messages) {
        const severity = message.severity === 2 ? 'Error' : 'Warning';
        output.push(
          `${relativePath}:${message.line}:${message.column}: ${message.message} [${severity}/${message.ruleId}]`
        );
      }
    }

    return output.join('\n');
  },
};
