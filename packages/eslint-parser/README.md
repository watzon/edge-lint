# @edge-lint/eslint-parser

ESLint parser for [Edge.js](https://edgejs.dev/) templates.

## Installation

```bash
npm install @edge-lint/eslint-parser --save-dev
```

## Usage

Use this parser with ESLint to lint `.edge` files. It's recommended to use this with `@edge-lint/eslint-plugin` for the best experience.

### ESLint Flat Config (eslint.config.js)

```javascript
import edgeParser from '@edge-lint/eslint-parser';

export default [
  {
    files: ['**/*.edge'],
    languageOptions: {
      parser: edgeParser,
    },
  },
];
```

### With @edge-lint/eslint-plugin

For full Edge.js linting support, use the plugin which includes this parser:

```javascript
import edge from '@edge-lint/eslint-plugin';

export default [
  ...edge.configs['flat/recommended'],
];
```

## How It Works

The parser:

1. Tokenizes Edge.js templates using `edge-lexer`
2. Extracts JavaScript expressions from mustaches and tags
3. Parses JavaScript using `espree` (ESLint's default parser)
4. Produces an ESLint-compatible AST

## Parser Options

```javascript
{
  languageOptions: {
    parser: edgeParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
}
```

## License

MIT
