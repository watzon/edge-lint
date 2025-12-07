/**
 * Init command - create configuration file
 */

import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

const DEFAULT_CONFIG = {
  rules: {
    'no-empty-mustache': 'error',
    'valid-expression': 'error',
    'no-unknown-tag': 'warn',
    'no-unused-let': 'warn',
    'mustache-spacing': ['warn', 'always'],
  },
};

export interface InitOptions {
  format?: 'json' | 'js';
  force?: boolean;
}

/**
 * Execute the init command
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const format = options.format ?? 'json';
  const filename = format === 'json' ? '.edgelintrc.json' : 'edge-lint.config.js';
  const filepath = path.resolve(process.cwd(), filename);

  // Check if file exists
  if (fs.existsSync(filepath) && !options.force) {
    console.log(chalk.yellow(`Configuration file already exists: ${filename}`));
    console.log(chalk.dim('Use --force to overwrite'));
    return;
  }

  // Write config file
  if (format === 'json') {
    fs.writeFileSync(filepath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf-8');
  } else {
    const content = `/** @type {import('@edge-lint/core').EdgeLintConfig} */
export default ${JSON.stringify(DEFAULT_CONFIG, null, 2)};
`;
    fs.writeFileSync(filepath, content, 'utf-8');
  }

  console.log(chalk.green(`✓ Created ${filename}`));
  console.log(chalk.dim('You can customize rules in this file'));
}
