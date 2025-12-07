/**
 * ESLint plugin type definitions
 */

import type { Linter, Rule as ESLintRule } from 'eslint';

/**
 * ESLint Rule with proper typing for Edge templates
 */
export interface EdgeESLintRule extends ESLintRule.RuleModule {
  meta: ESLintRule.RuleMetaData;
  create: ESLintRule.RuleModule['create'];
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  rules: Record<string, ESLintRule.RuleModule>;
  configs: Record<string, Linter.Config>;
  processors?: Record<string, Linter.Processor>;
  meta?: {
    name: string;
    version: string;
  };
}
