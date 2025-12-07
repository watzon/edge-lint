# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

edge-lint is a comprehensive linter for [Edge.js](https://edgejs.dev/) templates. It's a TypeScript monorepo using pnpm workspaces with five packages:

| Package | Purpose |
|---------|---------|
| `@edge-lint/core` | Core linting engine with tokenization, rule execution, and fix application |
| `@edge-lint/cli` | Command-line interface using Commander.js |
| `@edge-lint/eslint-parser` | ESLint-compatible parser for .edge files |
| `@edge-lint/eslint-plugin` | ESLint plugin exposing rules and configs |
| `@edge-lint/lsp` | Language Server Protocol server for IDE integration |

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Build single package
pnpm --filter @edge-lint/core build

# Watch mode for a package
pnpm --filter @edge-lint/core dev

# Run all tests
pnpm -r test

# Run tests for a single package
pnpm --filter @edge-lint/core test

# Lint codebase
pnpm lint

# Format code
pnpm format

# Clean all build artifacts
pnpm clean
```

## Architecture

### Core Package (`packages/core`)

The core engine follows an ESLint-inspired architecture:

- **Linter** (`src/linter.ts`): Main entry point. Coordinates tokenization via `edge-lexer`, runs rules against tokens, collects messages, and applies fixes iteratively
- **SourceCode** (`src/source-code.ts`): Wraps source text and tokens, provides utilities like `getText()`, `getRange()`, location conversions
- **RuleContext** (`src/rule-context.ts`): Passed to rules, provides `report()` for emitting messages and access to source/options
- **Fixer** (`src/fixer.ts`): Creates and applies text fixes using byte ranges

### Rule System

Rules live in `packages/core/src/rules/` organized by category:
- `syntax/` - Syntax validation (no-empty-mustache, valid-expression, no-unknown-tag)
- `best-practices/` - Code quality (no-unused-let, prefer-safe-mustache)
- `style/` - Formatting (mustache-spacing)

Each rule exports an object implementing the `Rule` interface:
```typescript
export const ruleName: Rule = {
  meta: { type, docs, messages, fixable?, schema? },
  create(context: RuleContext): TokenVisitor {
    return {
      Mustache(token) { /* check token, call context.report() */ },
      Tag(token) { /* ... */ },
    };
  },
};
```

**Token visitor hooks**: `Tag`, `Tag:exit`, `Mustache`, `SafeMustache`, `EscapedMustache`, `Raw`, `Comment`, `NewLine`, `Program`, `Program:exit`

### ESLint Integration

- **Parser** (`packages/eslint-parser`): Converts Edge templates to an ESLint-compatible AST using `espree` for JS expressions
- **Plugin** (`packages/eslint-plugin`): Adapts core rules to ESLint rule format, provides `flat/recommended` and `flat/strict` configs

### LSP Server

`packages/lsp` provides real-time diagnostics and quick fixes. Uses `vscode-languageserver` with the core `Linter` for validation.

## Package Dependencies

```
@edge-lint/eslint-plugin
    ├── @edge-lint/eslint-parser
    │   └── @edge-lint/core
    └── @edge-lint/core

@edge-lint/cli
    └── @edge-lint/core

@edge-lint/lsp
    └── @edge-lint/core
```

Workspace dependencies use `workspace:*` protocol in package.json.

## Key External Dependencies

- `edge-lexer` / `edge-parser`: Official Edge.js tokenizer and parser
- `espree`: ESLint's default JS parser (used in eslint-parser)
- `vscode-languageserver`: LSP implementation for Node.js
- `vitest`: Test runner (configured per-package)

## Configuration

Linter config via `.edgelintrc.json`:
```json
{
  "rules": {
    "no-empty-mustache": "error",
    "mustache-spacing": ["warn", "always"]
  },
  "parserOptions": {
    "tags": { "customTag": { "block": true, "seekable": true } }
  }
}
```

## TypeScript Configuration

- ES2022 target with NodeNext module resolution
- Strict mode enabled with additional checks (noUnusedLocals, noUnusedParameters, noImplicitReturns)
- Each package extends `tsconfig.base.json` from root
