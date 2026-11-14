import { defineConfig, devices } from '@playwright/test';
import { testTimeout } from './e2e/lib/timeouts';

const appPort = 3210;
const slowMo = Number.parseInt(process.env.PLAYWRIGHT_SLOW_MO ?? '0', 10);

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  workers: 6,
  timeout: testTimeout(30_000),
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${appPort}`,
    colorScheme: 'dark',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
  },
  projects: [
    {
      name: 'setup',
      testDir: './e2e/setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
