import { readFile } from 'node:fs/promises';
import {
  devices,
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
  type Locator,
  type Page,
  type Request,
  type WebSocketRoute,
} from '@playwright/test';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  setupAnonymousInvite,
  signUpViaApi,
  type AuthenticatedUser,
} from '../lib/auth';
import { startCallFromTopNav } from '../lib/calls';
import { createTestMessage, createTestUser } from '../lib/data';
import { createLargePng, expectImageToLoad } from '../lib/images';
import { createInvite } from '../lib/invites';
import { scrollThroughAllPages } from '../lib/infinite-scroll';
import { createMessages } from '../lib/messages';
import { expectRightPanelToResize } from '../lib/right-panel';
import {
  createServer,
  createServerAdmin,
  getDefaultServer,
  getServerBySlug,
} from '../lib/servers';
import { ChatPage } from '../pages/chat.page';
import { NavigationPage } from '../pages/navigation.page';

type PollResponse = {
  poll: {
    id: string;
  };
};

type JoinCallResponse = {
  call: {
    id: string;
  };
};

type ChannelResponse = { channel: { id: string } };

const unreadFeedItems = [
  {
    label: 'poll',
    payload: (body: string) => ({
      body,
      pollType: 'poll',
      options: ['Option A', 'Option B'],
    }),
  },
  {
    label: 'proposal',
    payload: (body: string) => ({
      body,
      pollType: 'proposal',
      action: { actionType: 'test' },
    }),
  },
];

const feedPageSize = 20;
const totalFeedMessages = 41;

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('authenticated user can send a basic chat message', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('chat'),
  );
  const message = createTestMessage('chat', authenticatedUser.user.suffix);
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  await chat.goto();

  await chat.expectChannel('general');
  await navigation.expectSignedInUser(authenticatedUser.user);
  await chat.sendMessage(message);
  await chat.expectMessage(message, authenticatedUser.user.name);
});

test('sending a message snaps a scrolled channel feed to the bottom', async ({
  context,
  page,
  request,
}) => {
  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('send-scroll'),
  );
  const server = await getDefaultServer(request, user);
  const existingMessages = Array.from(
    { length: feedPageSize },
    (_, index) =>
      `Existing message ${String(index + 1).padStart(2, '0')} ${
        user.user.suffix
      }`,
  );
  await createMessages({
    request,
    user,
    serverId: server.id,
    channelId: server.generalChannelId,
    bodies: existingMessages,
  });

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  const feed = page.getByTestId('feed');
  await expect(feed.getByText(existingMessages.at(-1)!)).toBeVisible();
  await feed.evaluate((element) => {
    element.scrollTop = -element.scrollHeight;
  });
  await expect
    .poll(() => feed.evaluate((element) => element.scrollTop))
    .toBeLessThan(-200);

  const message = createTestMessage('send-scroll', user.user.suffix);
  const chat = new ChatPage(page);
  await chat.sendMessage(message);

  await expect
    .poll(() => feed.evaluate((element) => element.scrollTop))
    .toBe(0);
  await expect(feed.getByText(message)).toBeVisible();
});

test('text channel feed preserves its pages and syncs only newer messages when revisited', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('text-scroll'),
  );
  const server = await getDefaultServer(request, user);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const otherChannelName = `other-${user.user.suffix}`;
  const createChannelResponse = await request.post(
    `/api/servers/${server.id}/channels`,
    {
      headers: authorizationHeaders(instanceAdmin),
      data: {
        name: otherChannelName,
        description: 'Channel used to verify feed cache behavior.',
        channelType: 'text',
      },
    },
  );
  await expect(createChannelResponse).toBeOK();
  const { channel: otherChannel } = (await createChannelResponse.json()) as {
    channel: { id: string };
  };

  const messageBodies = Array.from(
    { length: totalFeedMessages },
    (_, index) =>
      `Infinite text message ${String(index + 1).padStart(2, '0')} ${
        user.user.suffix
      }`,
  );
  await createMessages({
    request,
    user,
    serverId: server.id,
    channelId: server.generalChannelId,
    bodies: messageBodies,
  });

  const feedPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/feed`;
  const firstPageResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.pathname === feedPath &&
      !url.searchParams.has('before') &&
      !url.searchParams.has('after') &&
      url.searchParams.get('limit') === String(feedPageSize) &&
      response.status() === 200
    );
  });
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await firstPageResponse;

  const feed = page.getByTestId('feed');
  const oldestMessage = messageBodies[0];
  await expect(feed.getByText(messageBodies.at(-1)!)).toBeVisible();
  await expect(feed.getByText(oldestMessage)).toHaveCount(0);

  await scrollThroughAllPages({
    page,
    scrollContainer: feed,
    pageSize: feedPageSize,
    totalItems: totalFeedMessages,
    direction: 'up',
    matchesPageResponse: (response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        url.pathname === feedPath &&
        url.searchParams.has('before') &&
        url.searchParams.get('limit') === String(feedPageSize) &&
        response.status() === 200
      );
    },
  });
  await expect(feed.getByText(oldestMessage)).toBeVisible();

  const otherFeedResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.pathname ===
        `/api/servers/${server.id}/channels/${otherChannel.id}/feed` &&
      !url.searchParams.has('before') &&
      !url.searchParams.has('after') &&
      response.status() === 200
    );
  });
  await page.getByRole('link', { name: otherChannelName, exact: true }).click();
  await otherFeedResponse;

  const newerMessage = `Message received while away ${user.user.suffix}`;
  await createMessages({
    request,
    user,
    serverId: server.id,
    channelId: server.generalChannelId,
    bodies: [newerMessage],
  });

  const revisitRequests: string[] = [];
  const recordRevisitedFeedRequest = (networkRequest: Request) => {
    const url = new URL(networkRequest.url());
    if (networkRequest.method() === 'GET' && url.pathname === feedPath) {
      revisitRequests.push(
        url.searchParams.has('after')
          ? 'after'
          : url.searchParams.has('before')
            ? 'before'
            : 'initial',
      );
    }
  };
  page.on('request', recordRevisitedFeedRequest);

  const newerMessagesResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.pathname === feedPath &&
      url.searchParams.has('after') &&
      response.status() === 200
    );
  });
  await page.getByRole('link', { name: 'general', exact: true }).click();
  await newerMessagesResponse;
  await page.waitForTimeout(500);
  page.off('request', recordRevisitedFeedRequest);

  expect(revisitRequests).toEqual(['after']);
  await expect(feed.getByText(newerMessage)).toBeVisible();
  await expect(feed.getByText(oldestMessage)).toBeVisible();
});

test('authenticated user can send a chat message with an image', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('chat-image'),
  );
  const message = createTestMessage(
    'chat-image',
    authenticatedUser.user.suffix,
  );
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  await chat.goto();

  await chat.expectChannel('general');
  await navigation.expectSignedInUser(authenticatedUser.user);

  const messageResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/messages') &&
      response.status() === 200,
  );

  await chat.attachImage();
  await chat.sendMessage(message);
  await messageResponse;

  await chat.expectMessage(message, authenticatedUser.user.name);
  await chat.expectAttachedImage();
});

test('upload progress is shown while a large image is sending', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('chat-upload-progress'),
  );
  const message = createTestMessage(
    'chat-upload-progress',
    authenticatedUser.user.suffix,
  );
  const chat = new ChatPage(page);

  await chat.goto();
  await chat.expectChannel('general');

  // Throttled so the upload and the processing that follows are observable
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 2_000,
    downloadThroughput: -1,
    uploadThroughput: 2 * 1024 * 1024,
  });

  await chat.attachImageBuffer(createLargePng(2600, 1200));

  const messageResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/messages') &&
      response.status() === 200,
  );
  await chat.sendMessage(message);

  const overlay = page.getByTestId('image-upload-overlay');
  const progress = overlay.getByRole('progressbar', {
    name: 'Uploading image',
  });
  await expect(overlay).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', /^\d+$/);

  await expect(progress).not.toHaveAttribute('aria-valuenow');

  await messageResponse;
  await expect(overlay).toBeHidden();

  await chat.expectMessage(message, authenticatedUser.user.name);
  await chat.expectAttachedImage();
});

test('invite holder can read a non-default server feed with images', async ({
  context,
  page,
  request,
}) => {
  const admin = await createServerAdmin(request, 'invite-feed-admin');
  const serverSlug = `invite-feed-${admin.user.suffix}`;
  await createServer(request, admin, {
    name: `Invite feed ${admin.user.suffix}`,
    slug: serverSlug,
    description: 'Non-default server for invite feed access.',
  });

  const getServerResponse = await request.get(
    `/api/servers/slug/${serverSlug}`,
    { headers: authorizationHeaders(admin) },
  );
  await expect(getServerResponse).toBeOK();
  const { server } = (await getServerResponse.json()) as {
    server: {
      id: string;
      slug: string;
      generalChannelId: string;
    };
  };

  const messageBody = createTestMessage('invite-feed', admin.user.suffix);
  const createMessageResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/messages`,
    {
      headers: authorizationHeaders(admin),
      multipart: {
        payload: JSON.stringify({ body: messageBody }),
        files: {
          name: 'valid-image.png',
          mimeType: 'image/png',
          buffer: await readFile('e2e/fixtures/valid-image.png'),
        },
      },
    },
  );
  await expect(createMessageResponse).toBeOK();
  const { message } = (await createMessageResponse.json()) as {
    message: { id: string };
  };

  const feedPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/feed`;
  const feedWithoutInviteResponse = await request.get(feedPath);
  expect(feedWithoutInviteResponse.status()).toBe(403);

  const inviteToken = await createInvite(request, admin, server.id);
  await context.addInitScript((token) => {
    window.localStorage.removeItem('access_token');
    window.localStorage.setItem('invite-token', token);
  }, inviteToken);

  const feedResponsePromise = page.waitForResponse((response) =>
    response.url().includes(feedPath),
  );
  const imageResponsePromise = page.waitForResponse((response) =>
    response.url().includes(`/messages/${message.id}/images/`),
  );
  await page.goto(`/s/${server.slug}`);

  expect((await feedResponsePromise).status()).toBe(200);
  await expect(page.getByText(messageBody)).toBeVisible();
  expect((await imageResponsePromise).status()).toBe(200);
  await expectImageToLoad(
    page.getByRole('img', { name: 'Attached image' }).first(),
  );
});

test('in-call chat feed preserves its pages and syncs only newer messages when reopened', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(90_000);

  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-scroll'),
  );
  const server = await getDefaultServer(request, user);

  try {
    await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

    const joinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response
          .url()
          .endsWith(
            `/api/servers/${server.id}/channels/${server.generalChannelId}/calls`,
          ) &&
        response.status() === 200,
    );
    await startCallFromTopNav(page);
    const callResponse = await joinCallResponse;
    const { call } = (await callResponse.json()) as JoinCallResponse;

    const messageBodies = Array.from(
      { length: totalFeedMessages },
      (_, index) =>
        `Infinite call message ${String(index + 1).padStart(2, '0')} ${
          user.user.suffix
        }`,
    );
    await createMessages({
      request,
      user,
      serverId: server.id,
      channelId: server.generalChannelId,
      callId: call.id,
      bodies: messageBodies,
    });

    const callFeedPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/calls/${call.id}/feed`;
    const firstPageResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        url.pathname === callFeedPath &&
        !url.searchParams.has('before') &&
        !url.searchParams.has('after') &&
        url.searchParams.get('limit') === String(feedPageSize) &&
        response.status() === 200
      );
    });
    await page.getByRole('button', { name: 'Open call chat' }).click();
    await firstPageResponse;

    const callChatPanel = page.getByRole('region', {
      name: 'In-call chat',
    });
    const callFeed = callChatPanel.getByTestId('feed');
    const oldestMessage = messageBodies[0];
    await expect(callFeed.getByText(messageBodies.at(-1)!)).toBeVisible();
    await expect(callFeed.getByText(oldestMessage)).toHaveCount(0);

    await scrollThroughAllPages({
      page,
      scrollContainer: callFeed,
      pageSize: feedPageSize,
      totalItems: totalFeedMessages,
      direction: 'up',
      matchesPageResponse: (response) => {
        const url = new URL(response.url());
        return (
          response.request().method() === 'GET' &&
          url.pathname === callFeedPath &&
          url.searchParams.has('before') &&
          url.searchParams.get('limit') === String(feedPageSize) &&
          response.status() === 200
        );
      },
    });

    await expect(callFeed.getByText(oldestMessage)).toBeVisible();

    await page.getByRole('button', { name: 'Open call chat' }).click();
    await expect(callChatPanel).toHaveCount(0);

    const newerMessage = `Call message received while closed ${user.user.suffix}`;
    await createMessages({
      request,
      user,
      serverId: server.id,
      channelId: server.generalChannelId,
      callId: call.id,
      bodies: [newerMessage],
    });

    const revisitRequests: string[] = [];
    const recordRevisitedFeedRequest = (networkRequest: Request) => {
      const url = new URL(networkRequest.url());
      if (networkRequest.method() === 'GET' && url.pathname === callFeedPath) {
        revisitRequests.push(
          url.searchParams.has('after')
            ? 'after'
            : url.searchParams.has('before')
              ? 'before'
              : 'initial',
        );
      }
    };
    page.on('request', recordRevisitedFeedRequest);

    const newerMessagesResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        url.pathname === callFeedPath &&
        url.searchParams.has('after') &&
        response.status() === 200
      );
    });
    await page.getByRole('button', { name: 'Open call chat' }).click();
    await newerMessagesResponse;
    page.off('request', recordRevisitedFeedRequest);

    const reopenedCallFeed = page
      .getByRole('region', { name: 'In-call chat' })
      .getByTestId('feed');
    expect(revisitRequests).toEqual(['after']);
    await expect(reopenedCallFeed.getByText(newerMessage)).toBeVisible();
    await expect(reopenedCallFeed.getByText(oldestMessage)).toBeVisible();
  } finally {
    await leaveCallIfVisible(page);
  }
});

test('authenticated user can create and vote on an in-call proposal', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  // A dedicated server keeps the call's decision panel empty at the start: the
  // call decision falls back to any proposal still open in the channel
  const serverAdmin = await createServerAdmin(request, 'call-proposal-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Call proposal ${serverAdmin.user.suffix}`,
    slug: `call-proposal-${serverAdmin.user.suffix}`,
  });
  const callInvite = await createInvite(request, serverAdmin, createdServer.id);
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-proposal-vote'),
    callInvite,
  );
  const server = await getServerBySlug(
    request,
    authenticatedUser,
    createdServer.slug,
  );
  const proposalBody = `In-call proposal ${authenticatedUser.user.suffix}`;
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  try {
    await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

    await chat.expectChannel('general');
    await navigation.expectSignedInUser(authenticatedUser.user);

    const joinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );

    await startCallFromTopNav(page);
    await joinCallResponse;
    await expect(page.getByText('Call in #general')).toBeVisible();

    const decisionResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/calls/') &&
        response.url().includes('/decisions') &&
        response.status() === 200,
    );

    await page.getByRole('button', { name: 'Decisions', exact: true }).click();
    await decisionResponse;

    const activeDecisionPanel = page.getByRole('region', {
      name: 'Active Decision',
    });
    await expect(activeDecisionPanel).toBeVisible();
    await expect(
      activeDecisionPanel.getByText('No active decision'),
    ).toBeVisible();
    await expectRightPanelToResize(page, activeDecisionPanel, 'callDecisions');

    await activeDecisionPanel
      .getByRole('button', { name: 'Create proposal' })
      .click();

    const proposalDialog = page.getByRole('dialog', {
      name: 'Create a New Proposal',
    });
    await proposalDialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Test' }).click();
    await proposalDialog
      .getByPlaceholder('Enter your proposal details...')
      .fill(proposalBody);
    await proposalDialog.getByRole('button', { name: 'Next' }).click();

    const createProposalResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response
          .url()
          .includes(`/channels/${server.generalChannelId}/calls/`) &&
        response.url().includes('/polls') &&
        response.status() === 200,
    );
    await proposalDialog
      .getByRole('button', { name: 'Create proposal' })
      .click();
    const createResponse = await createProposalResponse;
    const { poll } = (await createResponse.json()) as PollResponse;

    await expect(proposalDialog).toBeHidden();

    const proposal = activeDecisionPanel.getByRole('article', {
      name: `Consensus proposal: ${proposalBody}`,
    });
    await expect(proposal).toBeVisible();
    await expect(
      activeDecisionPanel.getByRole('heading', {
        name: 'Active Decision',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      activeDecisionPanel.getByText(/0\/\d+ responded/),
    ).toBeVisible();

    const disagreeButton = proposal.getByRole('button', { name: 'Disagree' });
    const initialBackground = await backgroundColor(disagreeButton);

    const createVoteResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes(`/polls/${poll.id}/votes`) &&
        response.status() === 200,
    );
    await disagreeButton.click();
    await createVoteResponse;

    await expect
      .poll(() => backgroundColor(disagreeButton))
      .not.toBe(initialBackground);

    const updateVoteResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        response.url().includes(`/polls/${poll.id}/votes/`) &&
        response.status() === 200,
    );
    await proposal.getByRole('button', { name: 'Abstain' }).click();
    await updateVoteResponse;

    await leaveCallIfVisible(page);
    const channelProposal = page.getByRole('article', {
      name: `Consensus proposal: ${proposalBody}`,
    });
    await expect(channelProposal).toBeVisible();
    await expect(channelProposal.getByText('Created in-call')).toBeVisible();
    await expect(
      channelProposal.getByRole('link', { name: 'View call' }),
    ).toBeVisible();
  } finally {
    await leaveCallIfVisible(page);
  }
});

test('anonymous user can send messages with an image attached', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const { admin, server } = await setupAnonymousInvite(
    request,
    context,
    'anon-chat-image',
  );
  const message = createTestMessage('anon-chat-image', admin.user.suffix);
  const chat = new ChatPage(page);

  await chat.gotoExplore();
  await chat.expectChannel('general');

  const anonSessionResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/api/auth/anon') &&
      response.status() === 200,
  );
  const messageResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response
        .url()
        .includes(`/channels/${server.generalChannelId}/messages`) &&
      response.status() === 200,
  );

  await chat.attachImage();
  await chat.sendMessage(message);
  await page.getByRole('button', { name: 'Send anonymously' }).click();
  await anonSessionResponse;
  await messageResponse;
  await expect(chat.messageFeed().getByText(message)).toBeVisible();
  await chat.expectAttachedImage();
});

async function leaveCallIfVisible(page: Page) {
  const leaveButton = page.getByRole('button', { name: 'Leave call' });
  if (!(await leaveButton.isVisible())) {
    return;
  }

  const leaveCallResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/leave') &&
      response.status() === 200,
  );

  await leaveButton.click();
  await leaveCallResponse;
}

async function backgroundColor(locator: Locator) {
  return locator.evaluate(
    (element) => window.getComputedStyle(element).backgroundColor,
  );
}

async function setupUnreadScenario(
  request: APIRequestContext,
  context: BrowserContext,
  label: string,
) {
  const reader = await createAuthenticatedUser(
    request,
    context,
    createTestUser(`${label}-reader`),
  );
  const author = await signUpViaApi(request, createTestUser(`${label}-author`));
  const server = await getDefaultServer(request, reader);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);

  const channelResponse = await request.post(
    `/api/servers/${server.id}/channels`,
    {
      headers: authorizationHeaders(instanceAdmin),
      data: {
        name: `unread-${reader.user.suffix}`,
        description: 'Channel used to verify unread channel indicators.',
        channelType: 'text',
      },
    },
  );
  await expect(channelResponse).toBeOK();
  const { channel } = (await channelResponse.json()) as ChannelResponse;

  return { server, author, otherChannelId: channel.id };
}

async function createPollViaApi(
  request: APIRequestContext,
  author: AuthenticatedUser,
  serverId: string,
  channelId: string,
  data: Record<string, unknown>,
) {
  const response = await request.post(
    `/api/servers/${serverId}/channels/${channelId}/polls`,
    { headers: authorizationHeaders(author), data },
  );

  await expect(response).toBeOK();
}

function channelLink(page: Page, serverSlug: string, channelId: string) {
  return page.locator(`a[href="/s/${serverSlug}/c/${channelId}"]`);
}

function unreadIndicator(scope: Locator) {
  return scope.getByTestId('channel-unread-indicator');
}

for (const feedItem of unreadFeedItems) {
  test(`channel list marks a channel unread when someone else creates a ${feedItem.label}`, async ({
    context,
    page,
    request,
  }) => {
    const { server, author, otherChannelId } = await setupUnreadScenario(
      request,
      context,
      feedItem.label,
    );

    await createPollViaApi(
      request,
      author,
      server.id,
      otherChannelId,
      feedItem.payload(`Unread ${feedItem.label} ${author.user.suffix}`),
    );

    await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

    const unreadChannel = channelLink(
      page,
      server.slug,
      otherChannelId,
    ).locator('..');
    await expect(unreadIndicator(unreadChannel)).toBeVisible();
    await expect(
      unreadIndicator(
        channelLink(page, server.slug, server.generalChannelId).locator('..'),
      ),
    ).toHaveCount(0);

    await page.goto(`/s/${server.slug}/c/${otherChannelId}`);
    await expect(unreadIndicator(unreadChannel)).toHaveCount(0);
  });
}

test.describe('mobile thread recovery', () => {
  const device = devices['Pixel 5'];
  test.use({
    viewport: device.viewport,
    userAgent: device.userAgent,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
  });

  for (const existingReplies of [0, 1]) {
    test(`mobile feed recovers ${existingReplies ? 'updated replies on an older message' : 'the first reply on a message'} after returning`, async ({
      context,
      page,
      request,
    }) => {
      test.setTimeout(60_000);
      const userA = await createAuthenticatedUser(
        request,
        context,
        createTestUser('reply-reader'),
      );
      const userB = await signUpViaApi(request, createTestUser('reply-sender'));
      const server = await getDefaultServer(request, userA);
      const messagesPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/messages`;
      const rootBody = `Message from A ${userA.user.suffix}`;
      const rootResponse = await request.post(messagesPath, {
        headers: authorizationHeaders(userA),
        data: { body: rootBody },
      });
      await expect(rootResponse).toBeOK();
      const { message: root } = (await rootResponse.json()) as {
        message: { id: string };
      };
      const postReply = async (body: string) => {
        const response = await request.post(
          `${messagesPath}/${root.id}/replies`,
          { headers: authorizationHeaders(userB), data: { body } },
        );
        await expect(response).toBeOK();
      };
      if (existingReplies) {
        await postReply(`Earlier reply ${userB.user.suffix}`);
        await createMessages({
          request,
          user: userA,
          serverId: server.id,
          channelId: server.generalChannelId,
          bodies: Array.from(
            { length: 21 },
            (_, index) => `Newer message ${index} ${userA.user.suffix}`,
          ),
        });
      }

      let away = false;
      let missedReplies = 0;
      await page.routeWebSocket('**/ws', (socket) => {
        const upstream = socket.connectToServer();
        upstream.onMessage((message) => {
          if (away) {
            if (JSON.parse(message.toString()).body?.type === 'threadReply')
              missedReplies++;
          } else socket.send(message);
        });
      });
      await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
      const feed = page.getByTestId('feed');
      const rootMessage = feed.locator(`[data-message-id="${root.id}"]`);
      if (existingReplies) {
        await expect(
          feed.getByText(`Newer message 20 ${userA.user.suffix}`),
        ).toBeVisible();
        const olderPage = page.waitForResponse(
          (response) =>
            response.url().includes('/feed?') &&
            new URL(response.url()).searchParams.has('before'),
        );
        await feed.evaluate((element) => {
          element.scrollTop = -element.scrollHeight;
        });
        await olderPage;
      }
      await rootMessage.scrollIntoViewIfNeeded();
      await expect(rootMessage.getByText(rootBody)).toBeVisible();
      await expect(page.getByTestId('thread-panel')).toHaveCount(0);
      if (existingReplies)
        await expect(
          rootMessage.getByRole('button', { name: /1 reply/ }),
        ).toBeVisible();
      else
        await expect(
          rootMessage.getByRole('button', { name: /repl/ }),
        ).toHaveCount(0);

      const cdp = await context.newCDPSession(page);
      away = true;
      await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
      const replyBody = `Reply from B while A is away ${userB.user.suffix}`;
      await postReply(replyBody);
      const regularBody = `Regular message while A is away ${userB.user.suffix}`;
      await createMessages({
        request,
        user: userB,
        serverId: server.id,
        channelId: server.generalChannelId,
        bodies: [regularBody],
      });
      await expect.poll(() => missedReplies).toBeGreaterThan(0);
      await page.waitForTimeout(15_000);
      away = false;
      await cdp.send('Page.setWebLifecycleState', { state: 'active' });
      await page.bringToFront();
      // Supply the foreground event that CDP unfreezing does not emit
      await page.evaluate(() =>
        document.dispatchEvent(new Event('visibilitychange')),
      );

      await expect(feed.getByText(regularBody)).toBeAttached();
      await rootMessage.scrollIntoViewIfNeeded();
      const summary = rootMessage.getByRole('button', {
        name: existingReplies ? /2 replies/ : /1 reply/,
      });
      await expect(summary).toBeVisible();
      await summary.click();
      await expect(
        page.getByTestId('thread-panel').getByText(replyBody),
      ).toBeVisible();
    });
  }

  test('open mobile thread recovers replies missed before resubscription', async ({
    context,
    page,
    request,
  }) => {
    const user = await createAuthenticatedUser(
      request,
      context,
      createTestUser('resume'),
    );
    const server = await getDefaultServer(request, user);
    const messagesPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/messages`;
    const rootResponse = await request.post(messagesPath, {
      headers: authorizationHeaders(user),
      data: { body: `Resume root ${user.user.suffix}` },
    });
    await expect(rootResponse).toBeOK();
    const { message: root } = (await rootResponse.json()) as {
      message: { id: string; body: string };
    };
    const repliesPath = `${messagesPath}/${root.id}/replies`;
    const postReply = async (body: string) => {
      const response = await request.post(repliesPath, {
        headers: authorizationHeaders(user),
        data: { body },
      });
      await expect(response).toBeOK();
    };

    let socket: WebSocketRoute;
    let upstream: WebSocketRoute;
    let holdSubscriptions = false;
    const pending: (() => void)[] = [];
    await page.routeWebSocket('**/ws', (route) => {
      socket = route;
      upstream = route.connectToServer();
      const connection = upstream;
      route.onMessage((message) => {
        if (holdSubscriptions) pending.push(() => connection.send(message));
        else connection.send(message);
      });
    });

    await page.goto(
      `/s/${server.slug}/c/${server.generalChannelId}?thread=${root.id}`,
    );
    const panel = page.getByTestId('thread-panel');
    await expect(panel.getByText(root.body)).toBeVisible();
    const baseline = `Live before leaving ${user.user.suffix}`;
    await postReply(baseline);
    await expect(panel.getByText(baseline)).toBeVisible();

    // Delay resubscription independently of HTTP, as on a recovering connection
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
    holdSubscriptions = true;
    await socket!.close({
      code: 1012,
      reason: 'Connection interrupted while away',
    });
    await upstream!.close();
    const awayReply = `Reply while away ${user.user.suffix}`;
    await postReply(awayReply);
    const resumeFetch = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === repliesPath &&
        response.request().method() === 'GET',
    );
    await cdp.send('Page.setWebLifecycleState', { state: 'active' });
    await page.bringToFront();
    // CDP unfreezing does not itself switch OS apps or emit a window focus event
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await resumeFetch;
    await expect(panel.getByText(awayReply)).toBeVisible();
    await expect.poll(() => pending.length).toBeGreaterThan(0);

    const gapReply = `Reply during reconnect ${user.user.suffix}`;
    await postReply(gapReply);
    holdSubscriptions = false;
    pending.splice(0).forEach((send) => send());

    // A later live reply proves the subscription recovered, but cannot replay the gap
    await expect(async () => {
      const probe = `Live after reconnect ${Date.now()}`;
      await postReply(probe);
      await expect(panel.getByText(probe)).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 5_000 });
    await expect(panel.getByText(gapReply)).toBeVisible();
  });
});

test.describe('mobile unread channels', () => {
  const device = devices['Pixel 5'];
  test.use({
    viewport: device.viewport,
    userAgent: device.userAgent,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
  });

  for (const feedItem of unreadFeedItems) {
    test(`nav sheet marks a channel unread when someone else creates a ${feedItem.label}`, async ({
      context,
      page,
      request,
    }) => {
      const { server, author, otherChannelId } = await setupUnreadScenario(
        request,
        context,
        `mobile-${feedItem.label}`,
      );

      await createPollViaApi(
        request,
        author,
        server.id,
        otherChannelId,
        feedItem.payload(`Unread ${feedItem.label} ${author.user.suffix}`),
      );

      await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

      const openNavSheet = page.getByRole('button', {
        name: 'Open navigation',
      });
      await openNavSheet.click();
      const unreadChannel = channelLink(page, server.slug, otherChannelId);
      await expect(unreadIndicator(unreadChannel)).toBeVisible();

      await unreadChannel.click();
      await expect(page).toHaveURL(new RegExp(`/c/${otherChannelId}$`));

      await openNavSheet.click();
      await expect(unreadIndicator(unreadChannel)).toHaveCount(0);
    });
  }
});
