#!/usr/bin/env node

/**
 * Thin helper that shells into the Rust Praxis Live CLI so developers can run
 * `npm run cli -- ...` without remembering the cargo path.
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliDir = resolve(repoRoot, 'cli');
const userArgs = process.argv.slice(2);

const result = spawnSync('cargo', ['run', '--', ...userArgs], {
  cwd: cliDir,
  stdio: 'inherit',
  env: {
    ...process.env,
  },
});

if (result.error) {
  console.error('Failed to spawn cargo:', result.error.message);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);
