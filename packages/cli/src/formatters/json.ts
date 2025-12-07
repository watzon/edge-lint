/**
 * JSON formatter - machine-readable output
 */

import type { LintResult } from '@edge-lint/core';
import type { Formatter, FormatterOptions } from '../types.js';

export const json: Formatter = {
  format(results: LintResult[], options: FormatterOptions = {}): string {
    const quiet = options.quiet ?? false;

    const output = results.map(result => {
      const messages = quiet
        ? result.messages.filter(m => m.severity === 2)
        : result.messages;

      return {
        filePath: result.filename,
        messages,
        errorCount: messages.filter(m => m.severity === 2).length,
        warningCount: messages.filter(m => m.severity === 1).length,
        fixableErrorCount: messages.filter(m => m.severity === 2 && m.fix).length,
        fixableWarningCount: messages.filter(m => m.severity === 1 && m.fix).length,
        source: result.source,
        output: result.output,
      };
    });

    return JSON.stringify(output, null, 2);
  },
};
