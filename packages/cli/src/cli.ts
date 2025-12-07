#!/usr/bin/env node
/**
 * CLI entry point
 */

import { Command } from 'commander';
import { lint } from './commands/lint.js';
import { init } from './commands/init.js';

const program = new Command();

program
  .name('edge-lint')
  .description('Linter for Edge.js templates')
  .version('0.1.0');

// Lint command (default)
program
  .command('lint [patterns...]', { isDefault: true })
  .description('Lint Edge.js template files')
  .option('-f, --fix', 'Automatically fix problems')
  .option('--format <format>', 'Output format (stylish, json, compact)', 'stylish')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-q, --quiet', 'Report errors only')
  .option('--max-warnings <number>', 'Number of warnings before failing', parseInt)
  .option('--ignore <patterns...>', 'Patterns to ignore')
  .option('--no-ignore', 'Disable default ignore patterns')
  .option('-o, --output-file <path>', 'Write output to file')
  .option('--debug', 'Enable debug output')
  .action(async (patterns: string[], options) => {
    try {
      const result = await lint({
        patterns,
        fix: options.fix,
        format: options.format,
        config: options.config,
        quiet: options.quiet,
        maxWarnings: options.maxWarnings,
        ignore: options.ignore,
        noIgnore: !options.ignore && options.noIgnore !== false ? false : options.noIgnore,
        outputFile: options.outputFile,
        debug: options.debug,
      });

      // Determine exit code
      let exitCode = 0;

      if (result.errorCount > 0) {
        exitCode = 1;
      } else if (
        options.maxWarnings !== undefined &&
        result.warningCount > options.maxWarnings
      ) {
        exitCode = 1;
      }

      process.exit(exitCode);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(2);
    }
  });

// Init command
program
  .command('init')
  .description('Create a configuration file')
  .option('--format <format>', 'Config format (json, js)', 'json')
  .option('--force', 'Overwrite existing config')
  .action(async (options) => {
    try {
      await init({
        format: options.format,
        force: options.force,
      });
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(2);
    }
  });

program.parse();
