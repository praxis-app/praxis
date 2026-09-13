import { spawnSync } from 'node:child_process';

const composeArgs = ['compose', '-f', 'e2e/docker-compose.e2e.yml'];
const appUrl = 'http://127.0.0.1:3210/api/health';

const run = (command: string, args: string[]) => {
  return spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });
};

const getExitCode = (status: number | null) => {
  return status ?? 1;
};

const cleanup = () => {
  return run('docker', [...composeArgs, 'down', '-v', '--remove-orphans']);
};

const waitForAppReady = async (timeoutMs: number) => {
  const deadline = Date.now() + timeoutMs;

  // Polls until the deadline; `timeoutMs` bounds it even if the app never starts
  while (Date.now() < deadline) {
    try {
      const response = await fetch(appUrl);

      if (response.ok) {
        return true;
      }
    } catch {
      // Keep polling until the timeout expires
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
};

let exitCode = 0;

try {
  const teardownBeforeStart = cleanup();
  if (teardownBeforeStart.status !== 0) {
    console.error('Failed to reset E2E Docker services before test startup.');
    exitCode = getExitCode(teardownBeforeStart.status);
  }

  if (exitCode === 0) {
    const startup = run('docker', [...composeArgs, 'up', '-d', '--build']);
    if (startup.status !== 0) {
      console.error('Failed to start E2E Docker services.');
      exitCode = getExitCode(startup.status);
    }
  }

  if (exitCode === 0) {
    const appReady = await waitForAppReady(120_000);
    if (!appReady) {
      console.error('Timed out waiting for the E2E app to become ready.');
      exitCode = 1;
    }
  }

  if (exitCode === 0) {
    const testRun = run('npx', [
      'playwright',
      'test',
      ...process.argv.slice(2),
    ]);
    exitCode = getExitCode(testRun.status);
  }
} finally {
  const teardown = cleanup();
  if (teardown.status !== 0) {
    console.error('Failed to clean up E2E Docker services.');
    if (exitCode === 0) {
      exitCode = getExitCode(teardown.status);
    }
  }
}

process.exit(exitCode);
