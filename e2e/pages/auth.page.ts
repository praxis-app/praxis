import { expect, type Page } from '@playwright/test';
import type { TestUser } from '../lib/data';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async gotoLanding() {
    await this.page.goto('/');
  }

  async gotoSignup() {
    await this.page.goto('/auth/signup');
  }

  async followSignupLink() {
    await this.page
      .getByRole('link', { name: 'Sign up', exact: true })
      .first()
      .click();
  }

  async logIn(user: TestUser) {
    await this.page.getByLabel('Email address').fill(user.email);
    await this.page.getByLabel('Password', { exact: true }).fill(user.password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async signUp(user: TestUser) {
    await this.page.getByLabel('Username').fill(user.name);
    await this.page.getByLabel('Email address').fill(user.email);
    await this.page.getByLabel('Password', { exact: true }).fill(user.password);
    await this.page.getByLabel('Confirm password').fill(user.password);
    await this.page.getByRole('button', { name: 'Create account' }).click();
  }

  async expectSignedUp() {
    await expect(this.page).toHaveURL(/\/s\/[^/]+\/c\/[^/]+\/?/);
  }
}
