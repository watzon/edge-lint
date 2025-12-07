/**
 * ESLint processor for Edge.js files
 *
 * The processor handles .edge files for ESLint.
 */

import type { Linter } from 'eslint';

/**
 * Processor for .edge files
 */
export const processor: Linter.Processor = {
  /**
   * Extract code blocks from .edge files
   *
   * For Edge templates, we return the entire file as-is since our
   * parser handles the Edge syntax directly.
   */
  preprocess(text: string, _filename: string): (string | Linter.ProcessorFile)[] {
    // Return the entire file - our parser will handle it
    return [text];
  },

  /**
   * Merge messages from all code blocks
   */
  postprocess(messages: Linter.LintMessage[][], _filename: string): Linter.LintMessage[] {
    // Flatten messages from all blocks (we only have one)
    return messages.flat();
  },

  /**
   * Indicate this processor supports autofix
   */
  supportsAutofix: true,
};
