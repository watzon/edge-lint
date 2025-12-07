/**
 * Edge.js LSP Server
 *
 * Provides diagnostics and code actions for Edge.js templates.
 */

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CodeActionKind,
  type Connection,
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateDocument, getQuickFixes } from './handlers/diagnostics.js';

// Create the connection and document manager
const connection: Connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Server capabilities
let hasWorkspaceFolderCapability = false;

/**
 * Initialize the server
 */
connection.onInitialize((params: InitializeParams): InitializeResult => {
  const capabilities = params.capabilities;

  // Check for capabilities
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Diagnostics are pushed from server
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      // Code actions for quick fixes
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix],
      },
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

/**
 * After initialization
 */
connection.onInitialized(() => {
  connection.console.log('Edge LSP server initialized');
});

/**
 * Handle document open - validate immediately
 */
documents.onDidOpen((event) => {
  validateAndSendDiagnostics(event.document);
});

/**
 * Handle document change - revalidate
 */
documents.onDidChangeContent((event) => {
  validateAndSendDiagnostics(event.document);
});

/**
 * Validate document and send diagnostics
 */
async function validateAndSendDiagnostics(document: TextDocument): Promise<void> {
  // Only lint .edge files
  if (!document.uri.endsWith('.edge')) {
    return;
  }

  const diagnostics = validateDocument(document);
  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

/**
 * Handle code action requests (quick fixes)
 */
connection.onCodeAction((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  return getQuickFixes(document, params);
});

// Listen for document events
documents.listen(connection);

// Start the server
connection.listen();

export { connection, documents };
