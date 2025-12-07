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

  // Or strict config (all rules enabled)
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

### Syntax Rules

| Rule | Description | Recommended | Fixable |
|------|-------------|:-----------:|:-------:|
| `edge/no-empty-mustache` | Disallow empty mustache expressions | error | |
| `edge/valid-expression` | Validate JavaScript expressions in mustaches and tags | error | |
| `edge/no-unknown-tag` | Warn when using unregistered tags | warn | |
| `edge/no-removed-tags` | Disallow tags removed in Edge.js v6 | error | |
| `edge/no-deprecated-helpers` | Disallow deprecated global helpers removed in Edge.js v6 | error | |
| `edge/no-deprecated-props-api` | Disallow deprecated $props methods removed in Edge.js v6 | error | |
| `edge/no-inline-block-tags` | Disallow block tags with content on the same line | error | |
| `edge/no-space-before-tag-args` | Disallow space between tag name and opening parenthesis | error | Yes |
| `edge/valid-each-syntax` | Validate @each loop syntax | error | |
| `edge/no-reserved-variable-names` | Disallow Edge.js reserved keywords as variable names | error | |
| `edge/no-invalid-end-tag` | Disallow invalid end tag names (use @end instead) | error | Yes |
| `edge/no-mismatched-curly-braces` | Ensure mustache braces are properly matched | error | |
| `edge/no-multiple-else` | Disallow multiple @else blocks in a conditional | error | |
| `edge/valid-vite-tag` | Validate @vite() tag arguments (AdonisJS) | off | |
| `edge/valid-entrypoint-tags` | Validate @entryPointStyles/@entryPointScripts tags (AdonisJS) | off | |

### Best Practice Rules

| Rule | Description | Recommended | Fixable |
|------|-------------|:-----------:|:-------:|
| `edge/no-unused-let` | Warn when a @let variable is never used | warn | |
| `edge/prefer-safe-mustache` | Suggest using safe mustache for HTML content | off | |
| `edge/require-slot-await` | Require await when calling $slots | warn | Yes |
| `edge/no-undefined-slot` | Warn when calling slots without existence check | off | |
| `edge/prefer-unless-over-negated-if` | Suggest @unless over @if with negation | off | Yes |
| `edge/no-assign-without-let` | Disallow @assign for variables not defined with @let | warn | |
| `edge/prefer-include-if` | Suggest @includeIf over @if + @include pattern | off | |
| `edge/no-raw-html-in-mustache` | Warn about potential XSS with unescaped output | off | |
| `edge/require-props-defaults` | Suggest $props.merge() for default prop values | off | |
| `edge/each-else-on-empty` | Suggest @else with @each for empty collection handling | off | |
| `edge/prefer-stack-push-once` | Suggest @pushOnceTo over @pushTo for scripts/styles | off | |

### Style Rules

| Rule | Description | Recommended | Fixable |
|------|-------------|:-----------:|:-------:|
| `edge/mustache-spacing` | Enforce consistent spacing inside mustache braces | off | Yes |
| `edge/prefer-component-tags` | Suggest component-as-tags syntax over @component() | off | |
| `edge/consistent-slot-naming` | Enforce consistent slot naming convention | off | |

## Configs

### `flat/recommended`

Enables recommended rules with sensible defaults. Suitable for most projects. Focuses on catching real errors while minimizing noise.

**Enabled as errors:**
- All syntax validation rules (except AdonisJS-specific ones)

**Enabled as warnings:**
- `no-unknown-tag`, `no-unused-let`, `require-slot-await`, `no-assign-without-let`

### `flat/strict`

Enables all rules for maximum validation. Best for projects requiring strict template quality.

**Additionally enables:**
- All best practice rules
- All style rules
- AdonisJS-specific rules (`valid-vite-tag`, `valid-entrypoint-tags`)

## License

MIT
