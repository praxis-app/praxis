import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  type AuthenticatedUser,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import { createForumChannel } from '../lib/forums';
import { createMessages } from '../lib/messages';
import { getDefaultServer } from '../lib/servers';
import { expectRightPanelToResize } from '../lib/right-panel';

type ChannelResponse = { channel: { id: string } };
type PollResponse = { poll: { id: string } };
type MessageResponse = { message: { id: string } };
type ForumPostResponse = { post: { id: string; rootMessageId: string } };
type JoinCallResponse = { call: { id: string } };

const openSearch = async (page: import('@playwright/test').Page) => {
  await page
    .getByRole('button', { name: 'Search', exact: true })
    .last()
    .click();
  const isDesktop = (page.viewportSize()?.width ?? 0) > 768;
  await expect(
    page.getByTestId(isDesktop ? 'search-panel' : 'search-dialog'),
  ).toBeVisible();
  await expect(
    page.getByTestId(isDesktop ? 'search-dialog' : 'search-panel'),
  ).toHaveCount(0);
};

const runSearch = async (
  page: import('@playwright/test').Page,
  query: string,
) => {
  await page.getByLabel('Search this server').fill(query);
};

const createChannel = async (
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  name: string,
) => {
  const response = await request.post(`/api/servers/${serverId}/channels`, {
    headers: authorizationHeaders(user),
    data: { name, description: `E2E search channel ${name}` },
  });
  await expect(response).toBeOK();
  return ((await response.json()) as ChannelResponse).channel;
};

const createPoll = async (
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  channelId: string,
  data: Record<string, unknown>,
) => {
  const response = await request.post(
    `/api/servers/${serverId}/channels/${channelId}/polls`,
    { headers: authorizationHeaders(user), data },
  );
  await expect(response).toBeOK();
  return ((await response.json()) as PollResponse).poll;
};

const createThreadReply = async (
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  channelId: string,
  rootMessageId: string,
  body: string,
) => {
  const response = await request.post(
    `/api/servers/${serverId}/channels/${channelId}/messages/${rootMessageId}/replies`,
    { headers: authorizationHeaders(user), data: { body } },
  );
  await expect(response).toBeOK();
  return ((await response.json()) as MessageResponse).message;
};

/** Seeds one searchable item of every kind behind a token unique to the run */
const seedSearchableContent = async (
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
) => {
  const token = `otterberry${user.user.suffix}`;

  // Only channel managers can open channels, so the admin creates them
  const admin = await getOrCreateInstanceAdmin(request);
  const channel = await createChannel(
    request,
    admin,
    serverId,
    `search-${user.user.suffix}`,
  );
  const otherChannel = await createChannel(
    request,
    admin,
    serverId,
    `search-other-${user.user.suffix}`,
  );
  const forumChannel = await createForumChannel(
    request,
    admin,
    serverId,
    `search-forum-${user.user.suffix}`,
  );

  // Older filler keeps the target message off the first feed page
  await createMessages({
    request,
    user,
    serverId,
    channelId: channel.id,
    bodies: [`Target message ${token}`],
  });
  await createMessages({
    request,
    user,
    serverId,
    channelId: channel.id,
    bodies: Array.from(
      { length: 60 },
      (_, index) => `Filler ${String(index + 1).padStart(2, '0')}`,
    ),
  });
  await createMessages({
    request,
    user,
    serverId,
    channelId: otherChannel.id,
    bodies: [`Other channel ${token}`],
  });

  const threadRootResponse = await request.post(
    `/api/servers/${serverId}/channels/${channel.id}/messages`,
    { headers: authorizationHeaders(user), data: { body: 'Thread root' } },
  );
  await expect(threadRootResponse).toBeOK();
  const threadRoot = ((await threadRootResponse.json()) as MessageResponse)
    .message;
  await createThreadReply(
    request,
    user,
    serverId,
    channel.id,
    threadRoot.id,
    `Thread reply ${token}`,
  );

  await createPoll(request, user, serverId, channel.id, {
    body: `Proposal body ${token}`,
    pollType: 'proposal',
    action: { actionType: 'test' },
  });
  await createPoll(request, user, serverId, channel.id, {
    body: 'Poll without the token in its body',
    pollType: 'poll',
    options: [`Option ${token}`, 'Option B'],
  });

  const forumPostResponse = await request.post(
    `/api/servers/${serverId}/channels/${forumChannel.id}/forum/posts`,
    {
      headers: authorizationHeaders(user),
      data: { title: `Forum post ${token}`, body: 'Opening message' },
    },
  );
  await expect(forumPostResponse).toBeOK();
  const forumPost = ((await forumPostResponse.json()) as ForumPostResponse)
    .post;
  const forumReplyResponse = await request.post(
    `/api/servers/${serverId}/channels/${forumChannel.id}/forum/posts/${forumPost.id}/replies`,
    {
      headers: authorizationHeaders(user),
      data: { body: `Forum reply ${token}` },
    },
  );
  await expect(forumReplyResponse).toBeOK();

  const callResponse = await request.post(
    `/api/servers/${serverId}/channels/${channel.id}/calls`,
    { headers: authorizationHeaders(user) },
  );
  await expect(callResponse).toBeOK();
  const { call } = (await callResponse.json()) as JoinCallResponse;
  await createMessages({
    request,
    user,
    serverId,
    channelId: channel.id,
    callId: call.id,
    bodies: [`Call message ${token}`],
  });
  const leaveResponse = await request.post(
    `/api/servers/${serverId}/channels/${channel.id}/calls/${call.id}/leave`,
    { headers: authorizationHeaders(user) },
  );
  await expect(leaveResponse).toBeOK();

  return {
    token,
    channel,
    otherChannel,
    forumChannel,
    forumPost,
    threadRoot,
    call,
  };
};

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('search finds every content kind, excludes poll option text, and reports its window', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(90_000);

  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('search-kinds'),
  );
  const server = await getDefaultServer(request, user);
  const { token, channel } = await seedSearchableContent(
    request,
    user,
    server.id,
  );

  await page.goto(`/s/${server.slug}/c/${channel.id}`);
  await openSearch(page);

  // The channel header search starts scoped, so widen it to every channel
  const panel = page.getByTestId('search-panel');
  await panel.getByLabel('Filter by channel').click();
  await page.getByRole('option', { name: 'All channels' }).click();
  await runSearch(page, token);

  const results = page.getByTestId('search-result');
  await expect(results.filter({ hasText: 'Target message' })).toHaveCount(1);
  await expect(results.filter({ hasText: 'Thread reply' })).toHaveCount(1);
  await expect(results.filter({ hasText: 'Proposal body' })).toHaveCount(1);
  await expect(results.filter({ hasText: 'Forum post' })).toHaveCount(1);
  await expect(results.filter({ hasText: 'Forum reply' })).toHaveCount(1);
  await expect(results.filter({ hasText: 'Call message' })).toHaveCount(1);

  // Poll option text is outside the searched fields
  await expect(results.filter({ hasText: 'Option ' })).toHaveCount(0);

  await expect(page.getByTestId('search-coverage')).toBeVisible();
  await results.filter({ hasText: 'Forum reply' }).click();
  await expect(page.getByTestId('search-panel')).toHaveCount(0);
  await expect(
    page.getByText(`Forum reply ${token}`, { exact: true }),
  ).toBeVisible();
});

test('desktop search shares the right panel, resizes, filters, and restores the channel', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(90_000);
  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('search-panel'),
  );
  const server = await getDefaultServer(request, user);
  const { token, channel } = await seedSearchableContent(
    request,
    user,
    server.id,
  );

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/s/${server.slug}/c/${channel.id}`);
  const decisions = page.getByRole('complementary', {
    name: 'Active Decisions',
  });
  await expect(decisions).toBeVisible();
  await openSearch(page);
  const panel = page.getByTestId('search-panel');
  await expect(decisions).toHaveCount(0);
  await expect(panel.getByLabel('Search this server')).toBeFocused();
  await runSearch(page, token);
  await expectRightPanelToResize(page, panel, 'search');
  await expect(panel.getByTestId('search-result').first()).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('desktop-search.png') });

  const feed = page.getByTestId('feed');
  await expect(feed).toBeVisible();
  const feedBox = await feed.boundingBox();
  const panelBox = await panel.boundingBox();
  expect(feedBox!.x + feedBox!.width).toBeLessThanOrEqual(panelBox!.x + 1);

  await panel.getByLabel('Filter by content type').click();
  await page.getByRole('option', { name: 'Proposal', exact: true }).click();
  await expect(panel.getByTestId('search-result')).toHaveCount(1);
  await expect(panel.getByTestId('search-result')).toContainText(
    'Proposal body',
  );

  await panel.getByLabel('Filter by channel').click();
  await page.keyboard.press('Escape');
  await expect(panel).toBeVisible();

  await expect(panel.getByLabel('Filter by channel')).toBeFocused();
  await panel.getByLabel('Search this server').press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(decisions).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Search', exact: true }),
  ).toBeFocused();

  await openSearch(page);
  await expect(panel.getByLabel('Search this server')).toHaveValue('');
  await panel.getByRole('button', { name: 'Close search' }).click();
  await expect(panel).toHaveCount(0);
  await expect(decisions).toBeVisible();
});
