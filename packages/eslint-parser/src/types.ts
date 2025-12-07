/**
 * ESLint parser type definitions
 */

import type { Token } from 'edge-lexer/types';

/**
 * ESTree-compatible location
 */
export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

/**
 * ESTree Program node extended with Edge tokens
 */
export interface EdgeProgram {
  type: 'Program';
  body: unknown[];
  sourceType: 'script' | 'module';
  range: [number, number];
  loc: SourceLocation;
  tokens: unknown[];
  comments: unknown[];
  edgeTokens: Token[];
  templateBody?: EdgeTemplateBody;
}

/**
 * Custom node for Edge template body
 */
export interface EdgeTemplateBody {
  type: 'EdgeTemplateBody';
  range: [number, number];
  loc: SourceLocation;
  tokens: Token[];
}

/**
 * Parser options for Edge.js templates
 */
export interface ParserOptions {
  /** ECMAScript version for JS expressions */
  ecmaVersion?: number;
  /** Source type */
  sourceType?: 'script' | 'module';
  /** Custom Edge tags */
  edgeTags?: Record<string, { block: boolean; seekable: boolean }>;
  /** File path */
  filePath?: string;
}

/**
 * Result from parseForESLint
 */
export interface ParseResult {
  ast: EdgeProgram;
  visitorKeys?: Record<string, string[]>;
  scopeManager?: unknown | null;
  services?: ParserServices;
}

/**
 * Parser services accessible in rules
 */
export interface ParserServices {
  /** Get all Edge tokens */
  getEdgeTokens(): Token[];
  /** Whether this is an Edge file */
  isEdgeFile: boolean;
}
