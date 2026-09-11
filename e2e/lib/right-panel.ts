import { expect, type Locator, type Page } from '@playwright/test';

type RightPanelType =
  | 'activeDecisions'
  | 'callChat'
  | 'callDecisions'
  | 'search'
  | 'thread'
  | 'forumPost';

const dragResizeHandle = async (page: Page, group: Locator, deltaX: number) => {
  const handle = group.getByRole('separator', { name: 'Resize right panel' });
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();

  const startX = box!.x + box!.width / 2;
  const startY = box!.y + box!.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY, { steps: 5 });
  await page.mouse.up();
};

const panelWidth = async (panel: Locator) =>
  (await panel.boundingBox())?.width ?? 0;

export const expectRightPanelToResize = async (
  page: Page,
  panelContent: Locator,
  panelType: RightPanelType,
) => {
  const panel = panelContent.locator('xpath=ancestor::*[@data-panel][1]');
  const group = panel.locator('xpath=parent::*[@data-group]');
  await expect(panel).toBeVisible();
  const initialWidth = await panelWidth(panel);

  await dragResizeHandle(page, group, 100);
  await expect.poll(() => panelWidth(panel)).toBeLessThan(initialWidth - 15);
  const narrowerWidth = await panelWidth(panel);

  await dragResizeHandle(page, group, -100);
  await expect
    .poll(() => panelWidth(panel))
    .toBeGreaterThan(narrowerWidth + 15);
  const resizedWidth = await panelWidth(panel);

  await expect
    .poll(async () => {
      const savedWidth = await page.evaluate((type) => {
        const widths = JSON.parse(
          localStorage.getItem('panel-widths') || '{}',
        ) as Record<string, number>;
        return widths[type];
      }, panelType);
      return Math.abs((savedWidth ?? 0) - resizedWidth);
    })
    .toBeLessThanOrEqual(1);
};
