/**
 * Rule adapter - wraps @edge-lint/core rules for ESLint
 *
 * This adapter allows using the core Edge lint rules within ESLint.
 */

import type { Rule as ESLintRule } from 'eslint';
import {
  Linter,
  builtinRules,
  type Rule,
  type RuleMeta,
} from '@edge-lint/core';
import type { ParserServices } from '@edge-lint/eslint-parser';

/**
 * Convert core rule meta to ESLint rule meta
 */
function convertMeta(meta: RuleMeta): ESLintRule.RuleMetaData {
  const eslintMeta: ESLintRule.RuleMetaData = {
    type: meta.type === 'problem' ? 'problem' : meta.type === 'suggestion' ? 'suggestion' : 'layout',
    docs: {
      description: meta.docs.description,
      recommended: meta.docs.recommended === true || meta.docs.recommended === 'error',
      url: meta.docs.url,
    },
    fixable: meta.fixable,
    hasSuggestions: meta.hasSuggestions,
    schema: meta.schema ?? [],
    deprecated: meta.deprecated,
    replacedBy: meta.replacedBy,
  };

  if (meta.messages) {
    eslintMeta.messages = meta.messages;
  }

  return eslintMeta;
}

/**
 * Create an ESLint rule from a core Edge lint rule
 */
export function createESLintRule(ruleId: string, coreRule: Rule): ESLintRule.RuleModule {
  return {
    meta: convertMeta(coreRule.meta),
    create(context): ESLintRule.RuleListener {
      // Get parser services and tokens
      const parserServices = context.sourceCode.parserServices as ParserServices | undefined;

      if (!parserServices?.isEdgeFile) {
        // Not an Edge file, skip
        return {};
      }

      const sourceCode = context.sourceCode;
      const text = sourceCode.text;

      // Create a mini linter just for this rule
      const linter = new Linter();

      // Get messages from running the rule
      const messages = linter.verify(text, context.filename, {
        rules: { [ruleId]: [2, ...context.options] },
      });

      // Report messages via ESLint context
      return {
        Program() {
          for (const message of messages) {
            const reportDescriptor: ESLintRule.ReportDescriptor = {
              loc: {
                start: { line: message.line, column: message.column },
                end: {
                  line: message.endLine ?? message.line,
                  column: message.endColumn ?? message.column + 1,
                },
              },
              message: message.message,
            };

            // Add fix if available
            if (message.fix) {
              reportDescriptor.fix = (fixer) => {
                return fixer.replaceTextRange(message.fix!.range, message.fix!.text);
              };
            }

            // Add suggestions if available
            if (message.suggestions && message.suggestions.length > 0) {
              reportDescriptor.suggest = message.suggestions.map((s) => ({
                desc: s.desc,
                fix: (fixer) => fixer.replaceTextRange(s.fix.range, s.fix.text),
              }));
            }

            context.report(reportDescriptor);
          }
        },
      };
    },
  };
}

/**
 * Create ESLint rules from all builtin core rules
 */
export function createAllRules(): Record<string, ESLintRule.RuleModule> {
  const rules: Record<string, ESLintRule.RuleModule> = {};

  for (const [id, rule] of Object.entries(builtinRules)) {
    rules[id] = createESLintRule(id, rule);
  }

  return rules;
}
