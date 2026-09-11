import { expect, type Locator, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

export class ChatPage {
  constructor(private readonly page: Page) {}

  messageFeed(): Locator {
    return this.page.getByTestId('feed');
  }

  async goto() {
    await this.page.goto('/');
  }

  async gotoExplore() {
    await this.page.goto('/explore');
  }

  async sendMessage(message: string) {
    const messageInput = this.page.getByPlaceholder('Send a message...');
    await messageInput.fill(message);
    await messageInput.press('Enter');
  }

  async attachImage() {
    await this.attachImageIn(this.page.locator('body'));
  }

  async attachImageIn(scope: Locator) {
    const visibleTestPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAAyklEQVR4nO3OyxHCQBADUcdAKI7Y+TkIOFEFht35SZo9uKsDeNtjsbZuwLUbZPUFer7bj1O5DRKbXCClaQjaj7PFNAO1mAyQ3mSDxCYXSGnygmSmAEhjioEEpjCIbcqAqKYkiGfKg0imEohhqoLgJgAIa8KAgCYYCGVCgiAmMKhuwoOKJgqoYmKB0iYiKGfighImOihqUoBCJhHIb9KBnCYpyGNSg0xTA2hu6gFNTG2gkakT9NfUDPo19YMupiVAn6YhaIVukNVyoBfIKmT1NebvTwAAAABJRU5ErkJggg==',
      'base64',
    );

    await scope.getByTestId('image-input').setInputFiles({
      name: 'visible-chat-image.png',
      mimeType: 'image/png',
      buffer: visibleTestPng,
    });

    await expect(scope.getByTestId('attached-image-preview')).toBeVisible();
  }

  async attachImageBuffer(buffer: Buffer, name = 'large-chat-image.png') {
    await this.page.getByTestId('image-input').setInputFiles({
      name,
      mimeType: 'image/png',
      buffer,
    });

    await expect(this.page.getByTestId('attached-image-preview')).toBeVisible();
  }

  async expectAttachedImage() {
    await expect(
      this.messageFeed().getByRole('img', { name: 'Attached image' }).first(),
    ).toBeVisible();
  }

  async expectChannel(channelName: string) {
    await expect(
      this.page.getByText(channelName, { exact: true }).first(),
    ).toBeVisible();
  }

  async expectMessage(message: string, author: string) {
    const feed = this.messageFeed();
    await expect(feed.getByText(message)).toBeVisible();
    await expect(feed.getByText(author).first()).toBeVisible();
  }
}
