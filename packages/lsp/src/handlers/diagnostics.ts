/**
 * Diagnostics handler
 *
 * Converts Edge lint messages to LSP diagnostics and code actions.
 */

import {
  Diagnostic,
  DiagnosticSeverity,
  CodeAction,
  CodeActionKind,
  TextEdit,
  type CodeActionParams,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Linter, type LintMessage, type EdgeLintConfig } from '@edge-lint/core';

// Default configuration for LSP
const DEFAULT_CONFIG: EdgeLintConfig = {
  rules: {
    'no-empty-mustache': 'error',
    'valid-expression': 'error',
    'no-unknown-tag': 'warn',
    'mustache-spacing': ['warn', 'always'],
  },
};

// Create a shared linter instance
const linter = new Linter({ config: DEFAULT_CONFIG });

/**
 * Convert lint severity to LSP DiagnosticSeverity
 */
function getSeverity(severity: 1 | 2): DiagnosticSeverity {
  return severity === 2
    ? DiagnosticSeverity.Error
    : DiagnosticSeverity.Warning;
}

/**
 * Convert lint message to LSP Diagnostic
 */
function toDiagnostic(message: LintMessage, _document: TextDocument): Diagnostic {
  // Convert line/column to positions (LSP is 0-indexed)
  const startLine = Math.max(0, message.line - 1);
  const startCol = Math.max(0, message.column);
  const endLine = Math.max(0, (message.endLine ?? message.line) - 1);
  const endCol = Math.max(0, message.endColumn ?? message.column + 1);

  const diagnostic: Diagnostic = {
    severity: getSeverity(message.severity),
    range: {
      start: { line: startLine, character: startCol },
      end: { line: endLine, character: endCol },
    },
    message: message.message,
    source: 'edge-lint',
    code: message.ruleId,
  };

  // Store fix data for code actions
  if (message.fix) {
    diagnostic.data = { fix: message.fix };
  }

  return diagnostic;
}

/**
 * Validate a document and return diagnostics
 */
export function validateDocument(document: TextDocument): Diagnostic[] {
  const text = document.getText();
  const filename = document.uri;

  // Run the linter
  const messages = linter.verify(text, filename);

  // Convert to diagnostics
  return messages.map((m) => toDiagnostic(m, document));
}

/**
 * Get code actions (quick fixes) for a document
 */
export function getQuickFixes(
  document: TextDocument,
  params: CodeActionParams
): CodeAction[] {
  const actions: CodeAction[] = [];

  // Go through diagnostics in the request
  for (const diagnostic of params.context.diagnostics) {
    // Check if this diagnostic has fix data
    const data = diagnostic.data as { fix?: { range: [number, number]; text: string } } | undefined;
    if (!data?.fix) continue;

    // Create a quick fix action
    const fix = data.fix;
    const action: CodeAction = {
      title: `Fix: ${diagnostic.message}`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [document.uri]: [
            TextEdit.replace(
              {
                start: document.positionAt(fix.range[0]),
                end: document.positionAt(fix.range[1]),
              },
              fix.text
            ),
          ],
        },
      },
    };

    actions.push(action);
  }

  return actions;
}
