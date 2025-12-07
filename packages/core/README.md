# @edge-lint/core

Core linting engine for [Edge.js](https://edgejs.dev/) templates.

## Installation

```bash
npm install @edge-lint/core
```

## Usage

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
console.log(result.messages); // Remaining issues
```

## API

### `Linter`

Main class for linting Edge.js templates.

#### Constructor Options

```typescript
interface LinterOptions {
  config?: {
    rules?: Record<string, RuleSeverity | [RuleSeverity, ...unknown[]]>;
    parserOptions?: {
      tags?: Record<string, TagDefinition>;
    };
  };
}
```

#### Methods

- `verify(source: string, filename?: string): LintMessage[]` - Lint source and return messages
- `verifyAndFix(source: string, filename?: string): { output: string; messages: LintMessage[]; fixed: boolean }` - Lint and apply fixes

### `SourceCode`

Wraps source text and tokens with utilities.

```typescript
const sourceCode = new SourceCode(source, tokens);
sourceCode.getText(token);      // Get token text
sourceCode.getRange(token);     // Get [start, end] range
sourceCode.getLines();          // Get array of lines
```

## Built-in Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| `no-empty-mustache` | Disallow empty mustache expressions | No |
| `valid-expression` | Validate JavaScript expressions | No |
| `no-unknown-tag` | Warn on unregistered Edge tags | No |
| `no-unused-let` | Detect unused `@let` variables | No |
| `prefer-safe-mustache` | Suggest safe mustache for HTML | No |
| `mustache-spacing` | Enforce consistent spacing | Yes |

## License

MIT
