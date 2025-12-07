# @edge-lint/cli

Command-line interface for the [Edge.js](https://edgejs.dev/) linter.

## Installation

```bash
# Global installation
npm install -g @edge-lint/cli

# Or use with npx
npx @edge-lint/cli '**/*.edge'
```

## Usage

```bash
# Lint files
edge-lint '**/*.edge'

# Lint with auto-fix
edge-lint '**/*.edge' --fix

# Specify config file
edge-lint '**/*.edge' --config .edgelintrc.json

# Output formats
edge-lint '**/*.edge' --format stylish   # Default, colorized output
edge-lint '**/*.edge' --format json      # JSON output
edge-lint '**/*.edge' --format compact   # One line per message

# Initialize config file
edge-lint init
```

## Options

| Option | Description |
|--------|-------------|
| `--fix` | Automatically fix problems |
| `--config <path>` | Path to config file |
| `--format <format>` | Output format (stylish, json, compact) |
| `--quiet` | Only report errors, not warnings |
| `--max-warnings <n>` | Exit with error if warnings exceed threshold |

## Configuration

Create `.edgelintrc.json` in your project root:

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

Or run `edge-lint init` to generate a config file interactively.

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Linting passed with no errors |
| `1` | Linting found errors |
| `2` | Configuration or runtime error |

## License

MIT
