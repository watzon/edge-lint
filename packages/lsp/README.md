# @edge-lint/lsp

Language Server Protocol (LSP) server for [Edge.js](https://edgejs.dev/) templates.

## Installation

```bash
npm install @edge-lint/lsp
```

## Usage

The LSP server provides real-time linting feedback in editors that support the Language Server Protocol.

### Running the Server

```bash
# Via npx
npx @edge-lint/lsp --stdio

# Or if installed globally
edge-lint-lsp --stdio
```

### VS Code Integration

Configure as a generic LSP client:

```json
{
  "languageserver": {
    "edge": {
      "command": "npx",
      "args": ["@edge-lint/lsp", "--stdio"],
      "filetypes": ["edge"]
    }
  }
}
```

### Neovim (nvim-lspconfig)

```lua
local lspconfig = require('lspconfig')
local configs = require('lspconfig.configs')

configs.edgelint = {
  default_config = {
    cmd = { 'npx', '@edge-lint/lsp', '--stdio' },
    filetypes = { 'edge' },
    root_dir = lspconfig.util.root_pattern('.edgelintrc.json', 'package.json'),
  },
}

lspconfig.edgelint.setup({})
```

## Features

- Real-time diagnostics as you type
- Quick fixes for auto-fixable rules
- Respects `.edgelintrc.json` configuration

## Server Capabilities

| Capability           | Supported         |
| -------------------- | ----------------- |
| `textDocumentSync`   | Full              |
| `diagnosticProvider` | Yes               |
| `codeActionProvider` | Yes (quick fixes) |

## License

MIT
