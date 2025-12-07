# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-06

### Added

- Initial release of edge-lint monorepo
- **@edge-lint/core** - Core linting engine
  - Tokenization via edge-lexer
  - Rule execution framework with visitor pattern
  - Auto-fix support with iterative application
  - SourceCode utilities for token and range operations
- **@edge-lint/cli** - Command-line interface
  - Glob pattern file matching
  - Multiple output formats (stylish, json, compact)
  - Auto-fix with `--fix` flag
  - Config file initialization with `init` command
- **@edge-lint/eslint-parser** - ESLint-compatible parser
  - Converts Edge templates to ESLint AST
  - JavaScript expression parsing via espree
- **@edge-lint/eslint-plugin** - ESLint plugin
  - Recommended and strict configs
  - All core rules exposed with `edge/` prefix
- **@edge-lint/lsp** - Language Server Protocol server
  - Real-time diagnostics
  - Quick fix code actions

### Rules

- `no-empty-mustache` - Disallow empty mustache expressions
- `valid-expression` - Validate JavaScript expressions in mustaches and tags
- `no-unknown-tag` - Warn on unregistered Edge tags
- `no-unused-let` - Detect unused `@let` variables
- `prefer-safe-mustache` - Suggest safe mustache for HTML content
- `mustache-spacing` - Enforce consistent spacing in mustaches (fixable)

[0.1.0]: https://github.com/watzon/edge-lint/releases/tag/v0.1.0
