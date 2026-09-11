import { expect, type Page } from '@playwright/test';

import { ACCESS_TOKEN_KEY } from '../lib/data';
import type { TestUser } from '../lib/data';

export class NavigationPage {
  constructor(private readonly page: Page) {}

  async expectSignedInUser(user: TestUser) {
    await expect(this.page.getByTitle(user.name).first()).toBeVisible();
  }

  async expectAccessTokenPersisted() {
    await expect
      .poll(
        () =>
          this.page.evaluate(
            (storageKey) => window.localStorage.getItem(storageKey),
            ACCESS_TOKEN_KEY,
          ),
        {
          message: 'access token is persisted',
        },
      )
      .not.toBeNull();
  }

  async expectAccessTokenCleared() {
    await expect
      .poll(() =>
        this.page.evaluate((storageKey) => {
          return window.localStorage.getItem(storageKey);
        }, ACCESS_TOKEN_KEY),
      )
      .toBeNull();
  }

  async logOut() {
    await this.page.getByRole('button', { name: / Online$/ }).click();
    await this.page.getByRole('menuitem', { name: 'Log out' }).click();
    const exploreNavigation = this.page.waitForURL(/\/explore\/?/);
    await this.page.getByRole('button', { name: 'Log out' }).click();
    await exploreNavigation;
    await expect(
      this.page.getByRole('link', { name: 'Log in', exact: true }).first(),
    ).toBeVisible();
  }
}
