import {
  expect,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';

interface Options {
  page: Page;
  scrollContainer: Locator;
  pageSize: number;
  totalItems: number;
  direction: 'up' | 'down';
  matchesPageResponse: (response: Response, loadedItemCount: number) => boolean;
  onPageLoaded?: (loadedItemCount: number) => Promise<void>;
}

export async function scrollThroughAllPages({
  page,
  scrollContainer,
  pageSize,
  totalItems,
  direction,
  matchesPageResponse,
  onPageLoaded,
}: Options) {
  if (totalItems <= pageSize) return;

  const delta = direction === 'down' ? 10_000 : -10_000;
  await scrollContainer.hover();

  for (
    let loadedItemCount = pageSize;
    loadedItemCount < totalItems;
    loadedItemCount += pageSize
  ) {
    const nextPageResponse = page.waitForResponse(
      (response) => matchesPageResponse(response, loadedItemCount),
      { timeout: 10_000 },
    );

    await page.mouse.wheel(0, delta);
    await nextPageResponse;
    await onPageLoaded?.(loadedItemCount);
  }

  await expect
    .poll(() =>
      scrollContainer.evaluate((element) => Math.abs(element.scrollTop)),
    )
    .toBeGreaterThan(0);
}
