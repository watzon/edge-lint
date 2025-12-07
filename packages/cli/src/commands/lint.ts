/**
 * Lint command - main linting functionality
 */

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import { Linter, type LintResult, type EdgeLintConfig } from '@edge-lint/core';
import { getFormatter } from '../formatters/index.js';
import type { CLIOptions } from '../types.js';

const DEFAULT_PATTERNS = ['**/*.edge'];
const DEFAULT_IGNORE = ['**/node_modules/**', '**/dist/**', '**/build/**'];

export interface LintCommandResult {
  results: LintResult[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

/**
 * Load configuration from file or use defaults
 */
async function loadConfig(configPath?: string): Promise<EdgeLintConfig> {
  // Default configuration
  const defaultConfig: EdgeLintConfig = {
    rules: {
      'no-empty-mustache': 'error',
      'valid-expression': 'error',
      'no-unknown-tag': 'warn',
      'mustache-spacing': ['warn', 'always'],
    },
  };

  if (!configPath) {
    // Try to find config file automatically
    const configNames = [
      '.edgelintrc.json',
      '.edgelintrc.js',
      '.edgelintrc.mjs',
      'edge-lint.config.json',
      'edge-lint.config.js',
      'edge-lint.config.mjs',
    ];

    for (const name of configNames) {
      const fullPath = path.resolve(process.cwd(), name);
      if (fs.existsSync(fullPath)) {
        configPath = fullPath;
        break;
      }
    }
  }

  if (!configPath) {
    return defaultConfig;
  }

  // Load config file
  const ext = path.extname(configPath);
  if (ext === '.json') {
    const content = fs.readFileSync(configPath, 'utf-8');
    return { ...defaultConfig, ...JSON.parse(content) };
  } else if (ext === '.js' || ext === '.mjs') {
    const module = await import(path.resolve(configPath));
    return { ...defaultConfig, ...module.default };
  }

  return defaultConfig;
}

/**
 * Find files to lint
 */
async function findFiles(patterns: string[], ignore: string[]): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore,
      absolute: true,
      nodir: true,
    });
    files.push(...matches);
  }

  // Deduplicate
  return [...new Set(files)];
}

/**
 * Lint a single file
 */
function lintFile(
  filePath: string,
  linter: Linter,
  config: EdgeLintConfig,
  fix: boolean
): LintResult {
  const source = fs.readFileSync(filePath, 'utf-8');

  if (fix) {
    const result = linter.verifyAndFix(source, filePath, config);

    // Write fixed content back if there were fixes
    if (result.output && result.output !== source) {
      fs.writeFileSync(filePath, result.output, 'utf-8');
    }

    return result;
  } else {
    const messages = linter.verify(source, filePath, config);
    return {
      filename: filePath,
      messages,
      errorCount: messages.filter(m => m.severity === 2).length,
      warningCount: messages.filter(m => m.severity === 1).length,
      fixableErrorCount: messages.filter(m => m.severity === 2 && m.fix).length,
      fixableWarningCount: messages.filter(m => m.severity === 1 && m.fix).length,
      source,
    };
  }
}

/**
 * Execute the lint command
 */
export async function lint(options: CLIOptions): Promise<LintCommandResult> {
  const patterns = options.patterns.length > 0 ? options.patterns : DEFAULT_PATTERNS;
  const ignore = options.noIgnore ? [] : [...DEFAULT_IGNORE, ...(options.ignore ?? [])];

  // Load configuration
  const config = await loadConfig(options.config);

  // Find files
  const files = await findFiles(patterns, ignore);

  if (files.length === 0) {
    return {
      results: [],
      errorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    };
  }

  // Create linter
  const linter = new Linter({ config });

  // Lint files
  const results: LintResult[] = [];
  for (const file of files) {
    try {
      const result = lintFile(file, linter, config, options.fix ?? false);
      results.push(result);
    } catch (error) {
      // Handle file read errors
      const err = error as Error;
      results.push({
        filename: file,
        messages: [{
          ruleId: 'file-error',
          severity: 2,
          message: `Error reading file: ${err.message}`,
          line: 1,
          column: 0,
        }],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      });
    }
  }

  // Format and output results
  const formatter = getFormatter(options.format ?? 'stylish');
  const output = formatter.format(results, {
    cwd: process.cwd(),
    quiet: options.quiet,
  });

  if (output) {
    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, output, 'utf-8');
    } else {
      console.log(output);
    }
  }

  // Calculate totals
  const totals = results.reduce(
    (acc, result) => ({
      errorCount: acc.errorCount + result.errorCount,
      warningCount: acc.warningCount + result.warningCount,
      fixableErrorCount: acc.fixableErrorCount + result.fixableErrorCount,
      fixableWarningCount: acc.fixableWarningCount + result.fixableWarningCount,
    }),
    { errorCount: 0, warningCount: 0, fixableErrorCount: 0, fixableWarningCount: 0 }
  );

  return {
    results,
    ...totals,
  };
}
