/**
 * @edge-lint/cli - Command-line interface for Edge.js linter
 */

export { lint, init } from './commands/index.js';
export { getFormatter, formatters } from './formatters/index.js';
export type { CLIOptions, Formatter, FormatterOptions } from './types.js';
