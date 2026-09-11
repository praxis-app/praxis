import { expect, test } from '@playwright/test';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import { createForumChannel, createForumPosts } from '../lib/forums';
import { expectRightPanelToResize } from '../lib/right-panel';
import { scrollThroughAllPages } from '../lib/infinite-scroll';
import {
  confirmRatifyingVote,
  makeProposalsRatifyWithOneAgreeVote,
  openCreateProposalDialog,
  selectRadixOption,
} from '../lib/polls';
import { getDefaultServer } from '../lib/servers';
import { ChatPage } from '../pages/chat.page';

type ForumPostResponse = {
  post: {
    id: string;
  };
};

const forumPostsPageSize = 20;
const totalForumPosts = 41;

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('forum post list loads every page when scrolled to the bottom', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('forum-scroll'),
  );
  const server = await getDefaultServer(request, user);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const forumChannel = await createForumChannel(
    request,
    instanceAdmin,
    server.id,
    `forum-scroll-${user.user.suffix}`,
  );
  const postTitles = Array.from(
    { length: totalForumPosts },
    (_, index) =>
      `Infinite forum post ${String(index + 1).padStart(2, '0')} ${
        user.user.suffix
      }`,
  );
  await createForumPosts(request, user, server.id, forumChannel.id, postTitles);

  const firstPageResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.pathname ===
        `/api/servers/${server.id}/channels/${forumChannel.id}/forum/posts` &&
      !url.searchParams.has('before') &&
      url.searchParams.get('limit') === String(forumPostsPageSize) &&
      response.status() === 200
    );
  });
  await page.goto(`/s/${server.slug}/c/${forumChannel.id}`);
  await firstPageResponse;

  const forumPostList = page.getByTestId('forum-post-list');
  const oldestPostTitle = postTitles[0];
  await expect(forumPostList.getByText(postTitles.at(-1)!)).toBeVisible();
  await expect(forumPostList.getByText(oldestPostTitle)).toHaveCount(0);

  await scrollThroughAllPages({
    page,
    scrollContainer: forumPostList,
    pageSize: forumPostsPageSize,
    totalItems: totalForumPosts,
    direction: 'down',
    matchesPageResponse: (response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        url.pathname ===
          `/api/servers/${server.id}/channels/${forumChannel.id}/forum/posts` &&
        url.searchParams.has('before') &&
        url.searchParams.get('limit') === String(forumPostsPageSize) &&
        response.status() === 200
      );
    },
  });

  await expect(forumPostList.getByText(oldestPostTitle)).toBeVisible();
});

test('user can move a text proposal to a forum, reply, vote, and see it ratified', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('forum-move'),
  );
  const server = await getDefaultServer(request, proposer);
  const forumChannelName = `forum-${proposer.user.suffix}`;
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const forumChannel = await createForumChannel(
    request,
    instanceAdmin,
    server.id,
    forumChannelName,
  );
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const proposalBody = `Move proposal ${proposer.user.suffix}`;
  const existingThreadReply = `Existing proposal reply ${proposer.user.suffix}`;
  const reply = `Moved proposal reply ${proposer.user.suffix}`;
  const chat = new ChatPage(page);

  await chat.goto();
  await chat.expectChannel('general');
  await openCreateProposalDialog(page);

  const createProposalDialog = page.getByRole('dialog', {
    name: 'Create a New Proposal',
  });
  await selectRadixOption(
    createProposalDialog,
    page,
    'Select an action type',
    'Test',
  );
  await createProposalDialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await createProposalDialog.getByRole('button', { name: 'Next' }).click();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await createProposalDialog
    .getByRole('button', { name: 'Create proposal' })
    .click();
  await createProposalResponse;
  await expect(createProposalDialog).toBeHidden();

  const textProposal = page
    .getByRole('article', {
      name: `Majority Vote Proposal: ${proposalBody}`,
    })
    .first();
  await expect(textProposal).toBeVisible();
  await textProposal
    .getByRole('button', { name: 'Open proposal menu' })
    .click();
  await page.getByRole('menuitem', { name: 'Reply' }).click();
  const threadPanel = page.getByTestId('thread-panel');
  await expect(threadPanel.getByText(proposalBody)).toBeVisible();
  const threadReplyResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      /\/polls\/[^/]+\/replies$/.test(new URL(response.url()).pathname) &&
      response.status() === 200,
  );
  await threadPanel
    .getByPlaceholder('Reply to thread...')
    .fill(existingThreadReply);
  await threadPanel.getByPlaceholder('Reply to thread...').press('Enter');
  await threadReplyResponse;
  await expect(threadPanel.getByText(existingThreadReply)).toBeVisible();
  await expect(textProposal.getByText('1 reply')).toBeVisible();
  await expect(
    textProposal.locator('[data-slot="card"]').getByText('1 reply'),
  ).toHaveCount(0);
  await expectRightPanelToResize(page, threadPanel, 'thread');

  const threadProposal = threadPanel.getByRole('article', {
    name: `Majority Vote Proposal: ${proposalBody}`,
  });
  await threadProposal
    .getByRole('button', { name: 'Open proposal menu' })
    .click();
  await page.getByRole('menuitem', { name: 'Move to forum' }).click();

  const moveDialog = page.getByRole('dialog', { name: 'Move to forum' });
  await moveDialog.getByRole('combobox').click();
  await page.getByRole('option', { name: forumChannelName }).click();

  const moveProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/move-to-forum') &&
      response.status() === 200,
  );
  await moveDialog.getByRole('button', { name: 'Move proposal' }).click();
  const movedProposalResponse = await moveProposalResponse;
  const { post } = (await movedProposalResponse.json()) as ForumPostResponse;

  await expect(page).toHaveURL(
    new RegExp(`/c/${forumChannel.id}/posts/${post.id}$`),
  );
  await expect(
    page.getByRole('article').getByRole('heading', { name: proposalBody }),
  ).toBeVisible();
  await expect(page.getByText(existingThreadReply)).toBeVisible();

  const forumProposal = page.getByRole('region', { name: 'Proposal' });
  await expect(forumProposal.getByText(proposalBody)).toBeVisible();
  await expect(
    forumProposal.getByRole('button', { name: 'Open proposal menu' }),
  ).toHaveCount(0);

  const activeCloseResponse = await request.post(
    `/api/servers/${server.id}/channels/${forumChannel.id}/forum/posts/${post.id}/close`,
    { headers: authorizationHeaders(proposer) },
  );
  expect(activeCloseResponse.status()).toBe(409);
  expect(await activeCloseResponse.json()).toMatchObject({
    error: 'Forum posts cannot be closed while their proposal is voting.',
  });

  await page.getByRole('button', { name: 'Open post menu' }).click();
  await expect(page.getByRole('menuitem', { name: 'Close post' })).toHaveCount(
    0,
  );
  await page.getByRole('menuitem', { name: 'View proposal settings' }).click();

  const proposalSettingsDialog = page.getByRole('dialog', {
    name: 'Proposal Settings',
  });
  await expect(proposalSettingsDialog).toBeVisible();
  await proposalSettingsDialog.getByRole('button', { name: 'Close' }).click();
  await expect(proposalSettingsDialog).toBeHidden();

  const replyResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/forum/posts/${post.id}/replies`) &&
      response.status() === 200,
  );
  await page.getByPlaceholder('Send a message...').fill(reply);
  await page.getByPlaceholder('Send a message...').press('Enter');
  await replyResponse;
  await expect(page.getByText(reply)).toBeVisible();

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/votes') &&
      response.status() === 200,
  );
  await forumProposal
    .getByRole('button', { name: 'Agree', exact: true })
    .click();
  await confirmRatifyingVote(page);
  await voteResponse;
  await expect(
    forumProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Open post menu' }).click();
  await expect(
    page.getByRole('menuitem', { name: 'Close post' }),
  ).toBeVisible();
});

test('user can turn a forum discussion into a ratified proposal', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('forum-discussion'),
  );
  const server = await getDefaultServer(request, proposer);
  const forumChannelName = `forum-${proposer.user.suffix}`;
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const forumChannel = await createForumChannel(
    request,
    instanceAdmin,
    server.id,
    forumChannelName,
  );
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const postTitle = `Forum discussion ${proposer.user.suffix}`;
  const postBody = `Opening message ${proposer.user.suffix}`;
  const reply = `Discussion reply ${proposer.user.suffix}`;
  const proposalBody = `Discussion proposal ${proposer.user.suffix}`;

  await page.goto(`/s/${server.slug}/c/${forumChannel.id}`);
  const newPostButton = page.getByRole('button', { name: 'New post' });
  await expect(newPostButton).toBeVisible();
  await newPostButton.click();

  const createPostDialog = page.getByRole('dialog', { name: 'Create post' });
  await createPostDialog.getByLabel('Title').fill(postTitle);
  await createPostDialog.getByLabel('Message').fill(postBody);

  const createPostResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${forumChannel.id}/forum/posts`) &&
      response.status() === 200,
  );
  await createPostDialog
    .getByRole('button', { name: 'Create discussion' })
    .click();
  const createdPostResponse = await createPostResponse;
  const { post } = (await createdPostResponse.json()) as ForumPostResponse;

  await expect(page).toHaveURL(
    new RegExp(`/c/${forumChannel.id}/posts/${post.id}$`),
  );
  await expect(
    page.getByRole('article').getByRole('heading', { name: postTitle }),
  ).toBeVisible();
  await expect(page.getByText(postBody)).toBeVisible();
  await expectRightPanelToResize(
    page,
    page.getByRole('heading', { name: postTitle }).last(),
    'forumPost',
  );
  await expect(
    page.getByRole('separator', { name: '0 replies' }),
  ).toBeVisible();

  const replyResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/forum/posts/${post.id}/replies`) &&
      response.status() === 200,
  );
  await page.getByPlaceholder('Send a message...').fill(reply);
  await page.getByPlaceholder('Send a message...').press('Enter');
  await replyResponse;
  await expect(page.getByText(reply)).toBeVisible();
  await expect(page.getByRole('separator', { name: '1 reply' })).toBeVisible();

  await page.getByRole('button', { name: 'Open post menu' }).click();
  await page
    .getByRole('menuitem', { name: 'Create proposal from discussion' })
    .click();

  const createProposalDialog = page.getByRole('dialog', {
    name: 'Create proposal from discussion',
  });
  await selectRadixOption(
    createProposalDialog,
    page,
    'Select an action type',
    'Test',
  );
  await createProposalDialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await createProposalDialog.getByRole('button', { name: 'Next' }).click();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/forum/posts/${post.id}/proposal`) &&
      response.status() === 200,
  );
  await createProposalDialog
    .getByRole('button', { name: 'Create proposal' })
    .click();
  await createProposalResponse;
  await expect(createProposalDialog).toBeHidden();

  const forumProposal = page.getByRole('region', { name: 'Proposal' });
  await expect(forumProposal.getByText(proposalBody)).toBeVisible();

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/votes') &&
      response.status() === 200,
  );
  await forumProposal
    .getByRole('button', { name: 'Agree', exact: true })
    .click();
  await confirmRatifyingVote(page);
  await voteResponse;
  await expect(
    forumProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();
});
