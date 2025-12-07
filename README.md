# edge-lint

A comprehensive linter for [Edge.js](https://edgejs.dev/) templates.

## Packages

| Package | Description |
|---------|-------------|
| [@edge-lint/core](./packages/core) | Core linting engine |
| [@edge-lint/cli](./packages/cli) | Command-line interface |
| [@edge-lint/eslint-parser](./packages/eslint-parser) | ESLint parser for .edge files |
| [@edge-lint/eslint-plugin](./packages/eslint-plugin) | ESLint plugin with rules |
| [@edge-lint/lsp](./packages/lsp) | Language Server Protocol server |

## Quick Start

### CLI

```bash
# Install
npm install -g @edge-lint/cli

# Lint files
edge-lint '**/*.edge'

# Fix issues automatically
edge-lint '**/*.edge' --fix

# Create config file
edge-lint init
```

### Programmatic API

```typescript
import { Linter } from '@edge-lint/core';

const linter = new Linter({
  config: {
    rules: {
      'no-empty-mustache': 'error',
      'mustache-spacing': ['warn', 'always'],
    },
  },
});

// Lint and get messages
const messages = linter.verify(template, 'template.edge');

// Lint and auto-fix
const result = linter.verifyAndFix(template, 'template.edge');
console.log(result.output); // Fixed source
```

### ESLint Integration

```javascript
// eslint.config.js
import edge from '@edge-lint/eslint-plugin';

export default [
  ...edge.configs['flat/recommended'],
];
```

## Rules

### Syntax

- **no-empty-mustache** - Disallow empty mustache expressions `{{ }}`
- **valid-expression** - Validate JavaScript expressions in mustaches and tags
- **no-unknown-tag** - Warn on unregistered Edge tags

### Best Practices

- **no-unused-let** - Detect unused `@let` variables
- **prefer-safe-mustache** - Suggest `{{{ }}}` for HTML content

### Style

- **mustache-spacing** - Enforce consistent spacing in mustaches

## Configuration

Create `.edgelintrc.json`:

```json
{
  "rules": {
    "no-empty-mustache": "error",
    "valid-expression": "error",
    "no-unknown-tag": "warn",
    "mustache-spacing": ["warn", "always"]
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Test
pnpm -r test
```

## License

MIT
