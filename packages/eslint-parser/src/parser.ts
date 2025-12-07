/**
 * ESLint parser implementation for Edge.js templates
 *
 * This parser tokenizes Edge templates and produces an AST compatible with ESLint.
 * It creates a minimal Program node with Edge tokens stored in a custom property.
 */

import { Tokenizer } from 'edge-lexer';
import type { Token, LexerTagDefinitionContract } from 'edge-lexer/types';
import type { ParserOptions, ParseResult, EdgeProgram, EdgeTemplateBody } from './types.js';

// Dynamic import for espree
let espreeModule: typeof import('espree') | null = null;
async function getEspree(): Promise<typeof import('espree')> {
  if (!espreeModule) {
    espreeModule = await import('espree');
  }
  return espreeModule;
}

// Default Edge.js tags
const DEFAULT_TAGS: Record<string, LexerTagDefinitionContract> = {
  if: { block: true, seekable: true },
  elseif: { block: false, seekable: true },
  else: { block: false, seekable: false },
  unless: { block: true, seekable: true },
  each: { block: true, seekable: true },
  let: { block: false, seekable: true },
  assign: { block: false, seekable: true },
  include: { block: false, seekable: true },
  includeIf: { block: false, seekable: true },
  component: { block: true, seekable: true },
  slot: { block: true, seekable: true },
  inject: { block: false, seekable: true },
  debugger: { block: false, seekable: false },
  section: { block: true, seekable: true },
  yield: { block: false, seekable: true },
  super: { block: false, seekable: false },
  layout: { block: false, seekable: true },
  set: { block: false, seekable: true },
  svg: { block: false, seekable: true },
  entryPointStyles: { block: false, seekable: true },
  entryPointScripts: { block: false, seekable: true },
  vite: { block: false, seekable: true },
};

/**
 * Create an empty ESTree Program node
 */
function createEmptyProgram(text: string): EdgeProgram {
  const lines = text.split('\n');
  const lastLine = lines[lines.length - 1] ?? '';

  return {
    type: 'Program',
    body: [],
    sourceType: 'module',
    range: [0, text.length],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: lines.length, column: lastLine.length },
    },
    tokens: [],
    comments: [],
    edgeTokens: [],
  };
}

/**
 * Create template body node from tokens
 */
function createTemplateBody(tokens: Token[], text: string): EdgeTemplateBody {
  const lines = text.split('\n');
  const lastLine = lines[lines.length - 1] ?? '';

  return {
    type: 'EdgeTemplateBody',
    range: [0, text.length],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: lines.length, column: lastLine.length },
    },
    tokens,
  };
}

/**
 * Parse Edge template source code
 */
export function parse(code: string, options?: ParserOptions): EdgeProgram {
  const result = parseForESLint(code, options);
  return result.ast;
}

/**
 * Parse Edge template for ESLint (main entry point)
 *
 * This is the function ESLint calls to parse files.
 */
export function parseForESLint(code: string, options: ParserOptions = {}): ParseResult {
  const filename = options.filePath ?? 'template.edge';

  // Merge custom tags with defaults
  const customTags: Record<string, LexerTagDefinitionContract> = {};
  if (options.edgeTags) {
    for (const [name, def] of Object.entries(options.edgeTags)) {
      customTags[name] = { block: def.block, seekable: def.seekable };
    }
  }
  const allTags = { ...DEFAULT_TAGS, ...customTags };

  // Tokenize the template
  let tokens: Token[] = [];
  try {
    const tokenizer = new Tokenizer(code, allTags, { filename });
    tokenizer.parse();
    tokens = tokenizer.tokens;
  } catch {
    // If tokenization fails, return empty program
    // The error will be caught by our lint rules instead
  }

  // Create the AST
  const ast = createEmptyProgram(code);
  ast.edgeTokens = tokens;
  ast.templateBody = createTemplateBody(tokens, code);

  // Visitor keys for ESLint to traverse our custom nodes
  // Include all Edge token types so ESLint doesn't warn about unknown nodes
  const visitorKeys = {
    Program: ['body', 'templateBody'],
    EdgeTemplateBody: ['tokens'],
    // Edge token types - these are leaf nodes (no children to traverse)
    tag: ['children'],
    e__tag: [],
    mustache: [],
    s__mustache: [],
    e__mustache: [],
    es__mustache: [],
    raw: [],
    newline: [],
    comment: [],
  };

  // Parser services for rules to access Edge tokens
  const services = {
    getEdgeTokens: () => tokens,
    isEdgeFile: true,
  };

  return {
    ast,
    visitorKeys,
    scopeManager: null, // Edge templates don't have traditional JS scopes
    services,
  };
}

/**
 * Parse a JavaScript expression (for validating expressions in mustaches/tags)
 */
export async function parseExpression(
  expression: string,
  options?: { ecmaVersion?: number }
): Promise<unknown | null> {
  try {
    const espree = await getEspree();
    // Wrap in parentheses to make it a valid expression statement
    const ast = espree.parse(`(${expression})`, {
      ecmaVersion: options?.ecmaVersion ?? 2022,
      sourceType: 'module',
    });

    // Return the expression inside the parentheses
    const body = (ast as { body?: Array<{ type: string; expression?: unknown }> }).body;
    const stmt = body?.[0];
    if (stmt && stmt.type === 'ExpressionStatement') {
      return stmt.expression ?? null;
    }
    return null;
  } catch {
    return null;
  }
}
