# @edge-lint/eslint-plugin

ESLint plugin for [Edge.js](https://edgejs.dev/) templates.

## Installation

```bash
npm install @edge-lint/eslint-plugin --save-dev
```

## Usage

### ESLint Flat Config (Recommended)

```javascript
// eslint.config.js
import edge from '@edge-lint/eslint-plugin';

export default [
  // Use recommended config
  ...edge.configs['flat/recommended'],

  // Or strict config (all rules as errors)
  // ...edge.configs['flat/strict'],
];
```

### Custom Configuration

```javascript
// eslint.config.js
import edge from '@edge-lint/eslint-plugin';
import edgeParser from '@edge-lint/eslint-parser';

export default [
  {
    files: ['**/*.edge'],
    plugins: {
      edge,
    },
    languageOptions: {
      parser: edgeParser,
    },
    rules: {
      'edge/no-empty-mustache': 'error',
      'edge/valid-expression': 'error',
      'edge/no-unknown-tag': 'warn',
      'edge/mustache-spacing': ['warn', 'always'],
    },
  },
];
```

## Rules

| Rule | Description | Recommended | Fixable |
|------|-------------|-------------|---------|
| `edge/no-empty-mustache` | Disallow empty mustache expressions | error | No |
| `edge/valid-expression` | Validate JavaScript expressions | error | No |
| `edge/no-unknown-tag` | Warn on unregistered Edge tags | warn | No |
| `edge/no-unused-let` | Detect unused `@let` variables | warn | No |
| `edge/prefer-safe-mustache` | Suggest safe mustache for HTML | off | No |
| `edge/mustache-spacing` | Enforce consistent spacing | warn | Yes |

## Configs

### `flat/recommended`

Enables recommended rules with sensible defaults. Suitable for most projects.

### `flat/strict`

Enables all rules as errors. For projects requiring strict template validation.

## License

MIT
