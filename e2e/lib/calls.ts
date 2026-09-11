import { expect, type Locator, type Page } from '@playwright/test';
import { assertUuid, runDatabaseCommand } from './db';

const confirmPreJoin = async (page: Page) => {
  await expect(
    page.getByRole('heading', { name: 'Check your setup' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Join now' }).click();
};

export const startCallFromTopNav = async (page: Page) => {
  await page.getByRole('button', { name: 'Call' }).click();
  await confirmPreJoin(page);
};

export const joinCallFromArtifact = async (
  page: Page,
  callArtifact: Locator,
) => {
  await callArtifact.getByRole('button', { name: 'Join active video' }).click();
  await confirmPreJoin(page);
};

export const ageActiveCallForStaleCleanup = (callId: string) => {
  assertUuid(callId, 'Call ID');

  const output = runDatabaseCommand(
    `UPDATE calls SET updated_at = now() - interval '25 hours' WHERE id = '${callId}' AND status = 'active';`,
  );

  expect(output).toContain('UPDATE 1');
};
