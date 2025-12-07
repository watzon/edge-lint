/**
 * Formatter exports
 */

export { stylish } from './stylish.js';
export { json } from './json.js';
export { compact } from './compact.js';

import type { Formatter } from '../types.js';
import { stylish } from './stylish.js';
import { json } from './json.js';
import { compact } from './compact.js';

export const formatters: Record<string, Formatter> = {
  stylish,
  json,
  compact,
};

export function getFormatter(name: string): Formatter {
  const formatter = formatters[name];
  if (!formatter) {
    throw new Error(`Unknown formatter: ${name}. Available: ${Object.keys(formatters).join(', ')}`);
  }
  return formatter;
}
