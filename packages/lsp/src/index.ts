/**
 * @edge-lint/lsp
 *
 * Language Server Protocol server for Edge.js templates
 */

export { connection, documents } from './server.js';
export { validateDocument, getQuickFixes } from './handlers/index.js';
