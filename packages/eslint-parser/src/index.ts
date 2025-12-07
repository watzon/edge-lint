/**
 * @edge-lint/eslint-parser
 *
 * ESLint parser for Edge.js templates
 */

export { parse, parseForESLint, parseExpression } from './parser.js';
export type {
  ParserOptions,
  ParseResult,
  EdgeProgram,
  EdgeTemplateBody,
  ParserServices,
} from './types.js';

// Meta information for ESLint
export const meta = {
  name: '@edge-lint/eslint-parser',
  version: '0.1.0',
};
