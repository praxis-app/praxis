import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  seedAuthenticatedSession,
  signUpViaApi,
} from '../lib/auth';
import {
  ageActiveCallForStaleCleanup,
  joinCallFromArtifact,
  startCallFromTopNav,
} from '../lib/calls';
import { createTestMessage, createTestUser } from '../lib/data';
import { createInvite } from '../lib/invites';
import { expectRightPanelToResize } from '../lib/right-panel';
import { getDefaultServer } from '../lib/servers';
import { ChatPage } from '../pages/chat.page';
import { NavigationPage } from '../pages/navigation.page';

type JoinCallResponse = {
  call: {
    id: string;
  };
};

const expectTileToRender = async (tile: Locator) => {
  await expect(tile).toBeVisible();
  await expect
    .poll(async () => {
      const box = await tile.boundingBox();

      return Math.min(box?.height ?? 0, box?.width ?? 0);
    })
    .toBeGreaterThan(100);
};

const expectRenderedParticipantTiles = async (
  page: { getByTestId: (testId: string) => Locator },
  count: number,
) => {
  const tiles = page.getByTestId('call-participant-tile');
  await expect(tiles).toHaveCount(count);

  for (let index = 0; index < count; index += 1) {
    await expectTileToRender(tiles.nth(index));
  }
};

const leaveCallIfVisible = async (page: Page) => {
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
};

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('authenticated user can start a call and see a video tile', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-video-tile'),
  );
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  try {
    await chat.goto();

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

    const tile = page.getByTestId('call-participant-tile').first();
    await expectTileToRender(tile);

    await page.setViewportSize({ height: 760, width: 390 });
    await expectTileToRender(tile);

    await page.setViewportSize({ height: 720, width: 1280 });
    await expectTileToRender(tile);

    const callFeedResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/calls/') &&
        response.url().includes('/feed') &&
        response.status() === 200,
    );

    await page.getByRole('button', { name: 'Open call chat' }).click();
    await callFeedResponse;
    await expectTileToRender(tile);
  } finally {
    await leaveCallIfVisible(page);
  }
});

test('starting a call immediately appears in other users channel feeds', async ({
  browser,
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const starter = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-feed-starter'),
  );
  const server = await getDefaultServer(request, starter);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const inviteToken = await createInvite(request, instanceAdmin, server.id);
  const observer = await signUpViaApi(
    request,
    createTestUser('call-feed-observer'),
    inviteToken,
  );
  const observerContext = await browser.newContext();

  try {
    await seedAuthenticatedSession(observerContext, observer.accessToken);
    const observerPage = await observerContext.newPage();
    const starterChat = new ChatPage(page);
    const observerChat = new ChatPage(observerPage);

    await starterChat.goto();
    await starterChat.expectChannel('general');
    await observerPage.goto(page.url());
    await observerChat.expectChannel('general');

    const observerCallArtifact = observerPage
      .locator('article')
      .filter({ hasText: `Started by ${starter.user.name}` });

    await expect(observerCallArtifact).toHaveCount(0);

    const joinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );

    await startCallFromTopNav(page);
    await joinCallResponse;

    await expect(observerCallArtifact).toContainText('Call is active');
    await expect(
      observerCallArtifact.getByRole('button', { name: 'Join active video' }),
    ).toBeVisible();

    const leaveCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith('/leave') &&
        response.status() === 200,
    );

    await page.getByRole('button', { name: 'Leave call' }).click();
    await leaveCallResponse;

    await expect(observerCallArtifact).toContainText('Call ended');
    await expect(
      observerCallArtifact.getByRole('button', { name: 'Join active video' }),
    ).toHaveCount(0);
  } finally {
    await observerContext.close();
  }
});

test('stale call cleanup updates other users channel feeds in realtime', async ({
  browser,
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const starter = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-stale-starter'),
  );
  const server = await getDefaultServer(request, starter);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const inviteToken = await createInvite(request, instanceAdmin, server.id);
  const observer = await signUpViaApi(
    request,
    createTestUser('call-stale-observer'),
    inviteToken,
  );
  const observerContext = await browser.newContext();

  try {
    await seedAuthenticatedSession(observerContext, observer.accessToken);
    const observerPage = await observerContext.newPage();
    const starterChat = new ChatPage(page);
    const observerChat = new ChatPage(observerPage);

    await starterChat.goto();
    await starterChat.expectChannel('general');
    await observerPage.goto(page.url());
    await observerChat.expectChannel('general');

    const observerCallArtifact = observerPage
      .locator('article')
      .filter({ hasText: `Started by ${starter.user.name}` });

    await expect(observerCallArtifact).toHaveCount(0);

    const joinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );

    await startCallFromTopNav(page);
    const startedCallResponse = await joinCallResponse;
    const startedCall = (await startedCallResponse.json()) as JoinCallResponse;

    await expect(observerCallArtifact).toContainText('Call is active');
    await expect(
      observerCallArtifact.getByRole('button', { name: 'Join active video' }),
    ).toBeVisible();

    ageActiveCallForStaleCleanup(startedCall.call.id);

    await expect(observerCallArtifact).toContainText('Call ended', {
      timeout: 20_000,
    });
    await expect(
      observerCallArtifact.getByRole('button', { name: 'Join active video' }),
    ).toHaveCount(0);
  } finally {
    await leaveCallIfVisible(page);
    await observerContext.close();
  }
});

test('second user can join an active call from the call artifact', async ({
  browser,
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const starter = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-artifact-starter'),
  );
  const server = await getDefaultServer(request, starter);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const inviteToken = await createInvite(request, instanceAdmin, server.id);
  const joiner = await signUpViaApi(
    request,
    createTestUser('call-artifact-joiner'),
    inviteToken,
  );
  const joinerContext = await browser.newContext();
  let joinerPage: Page | undefined;

  try {
    await seedAuthenticatedSession(joinerContext, joiner.accessToken);
    joinerPage = await joinerContext.newPage();
    const starterChat = new ChatPage(page);
    const joinerChat = new ChatPage(joinerPage);

    await starterChat.goto();
    await starterChat.expectChannel('general');
    await joinerPage.goto(page.url());
    await joinerChat.expectChannel('general');

    const joinerCallArtifact = joinerPage
      .locator('article')
      .filter({ hasText: `Started by ${starter.user.name}` });

    const starterJoinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );

    await startCallFromTopNav(page);
    await starterJoinCallResponse;
    await expect(page.getByText('Call in #general')).toBeVisible();
    await expectRenderedParticipantTiles(page, 1);
    await joinerPage.reload();
    await joinerChat.expectChannel('general');

    await expect(joinerCallArtifact).toContainText('Call is active');

    const joinerJoinCallResponse = joinerPage.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/calls/') &&
        response.url().endsWith('/join') &&
        response.status() === 200,
    );

    await joinCallFromArtifact(joinerPage, joinerCallArtifact);
    await joinerJoinCallResponse;
    await expect(joinerPage.getByText('Call in #general')).toBeVisible();

    await expectRenderedParticipantTiles(page, 2);
    await expectRenderedParticipantTiles(joinerPage, 2);

    await leaveCallIfVisible(joinerPage);
    await leaveCallIfVisible(page);
  } finally {
    if (joinerPage) {
      await leaveCallIfVisible(joinerPage);
    }
    await leaveCallIfVisible(page);
    await joinerContext.close();
  }
});

test('multi-user call stays active until the last participant leaves', async ({
  browser,
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const starter = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-last-leaver-starter'),
  );
  const server = await getDefaultServer(request, starter);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const inviteToken = await createInvite(request, instanceAdmin, server.id);
  const joiner = await signUpViaApi(
    request,
    createTestUser('call-last-leaver-joiner'),
    inviteToken,
  );
  const joinerContext = await browser.newContext();
  let joinerPage: Page | undefined;

  try {
    await seedAuthenticatedSession(joinerContext, joiner.accessToken);
    joinerPage = await joinerContext.newPage();
    const starterChat = new ChatPage(page);
    const joinerChat = new ChatPage(joinerPage);

    await starterChat.goto();
    await starterChat.expectChannel('general');
    await joinerPage.goto(page.url());
    await joinerChat.expectChannel('general');

    const starterCallArtifact = page
      .locator('article')
      .filter({ hasText: `Started by ${starter.user.name}` });
    const joinerCallArtifact = joinerPage
      .locator('article')
      .filter({ hasText: `Started by ${starter.user.name}` });

    const starterJoinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );

    await startCallFromTopNav(page);
    await starterJoinCallResponse;
    await expect(page.getByText('Call in #general')).toBeVisible();
    await expectRenderedParticipantTiles(page, 1);

    await joinerPage.reload();
    await joinerChat.expectChannel('general');
    await expect(joinerCallArtifact).toContainText('Call is active');

    const joinerJoinCallResponse = joinerPage.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/calls/') &&
        response.url().endsWith('/join') &&
        response.status() === 200,
    );

    await joinCallFromArtifact(joinerPage, joinerCallArtifact);
    await joinerJoinCallResponse;
    await expect(joinerPage.getByText('Call in #general')).toBeVisible();
    await expectRenderedParticipantTiles(page, 2);
    await expectRenderedParticipantTiles(joinerPage, 2);

    const starterLeaveCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith('/leave') &&
        response.status() === 200,
    );

    await page.getByRole('button', { name: 'Leave call' }).click();
    await starterLeaveCallResponse;

    await expectRenderedParticipantTiles(joinerPage, 1);
    await expect(starterCallArtifact).toContainText('Call is active');
    await expect(starterCallArtifact).not.toContainText('Call ended');

    const joinerLeaveCallResponse = joinerPage.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith('/leave') &&
        response.status() === 200,
    );

    await joinerPage.getByRole('button', { name: 'Leave call' }).click();
    await joinerLeaveCallResponse;

    await expect(starterCallArtifact).toContainText('Call ended');
  } finally {
    if (joinerPage) {
      await leaveCallIfVisible(joinerPage);
    }
    await leaveCallIfVisible(page);
    await joinerContext.close();
  }
});

test('in-call chat messages are delivered realtime between participants', async ({
  browser,
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const starter = await createAuthenticatedUser(
    request,
    context,
    createTestUser('call-chat-realtime-starter'),
  );
  const message = createTestMessage('call-chat-realtime', starter.user.suffix);
  const server = await getDefaultServer(request, starter);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const inviteToken = await createInvite(request, instanceAdmin, server.id);
  const joiner = await signUpViaApi(
    request,
    createTestUser('call-chat-realtime-joiner'),
    inviteToken,
  );
  const joinerContext = await browser.newContext();
  let joinerPage: Page | undefined;

  try {
    await seedAuthenticatedSession(joinerContext, joiner.accessToken);
    joinerPage = await joinerContext.newPage();
    const starterChat = new ChatPage(page);
    const joinerChat = new ChatPage(joinerPage);

    await starterChat.goto();
    await starterChat.expectChannel('general');
    await joinerPage.goto(page.url());
    await joinerChat.expectChannel('general');

    const joinerCallArtifact = joinerPage
      .locator('article')
      .filter({ hasText: `Started by ${starter.user.name}` });

    const starterJoinCallResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );

    await startCallFromTopNav(page);
    await starterJoinCallResponse;
    await expect(page.getByText('Call in #general')).toBeVisible();
    await expectRenderedParticipantTiles(page, 1);

    await joinerPage.reload();
    await joinerChat.expectChannel('general');
    await expect(joinerCallArtifact).toContainText('Call is active');

    const joinerJoinCallResponse = joinerPage.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/calls/') &&
        response.url().endsWith('/join') &&
        response.status() === 200,
    );

    await joinCallFromArtifact(joinerPage, joinerCallArtifact);
    await joinerJoinCallResponse;
    await expect(joinerPage.getByText('Call in #general')).toBeVisible();
    await expectRenderedParticipantTiles(page, 2);
    await expectRenderedParticipantTiles(joinerPage, 2);

    const starterCallFeedResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/calls/') &&
        response.url().includes('/feed') &&
        response.status() === 200,
    );
    await page.getByRole('button', { name: 'Open call chat' }).click();
    await starterCallFeedResponse;

    const joinerCallFeedResponse = joinerPage.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/calls/') &&
        response.url().includes('/feed') &&
        response.status() === 200,
    );
    await joinerPage.getByRole('button', { name: 'Open call chat' }).click();
    await joinerCallFeedResponse;

    const starterCallChatPanel = page.getByRole('region', {
      name: 'In-call chat',
    });
    const joinerCallChatPanel = joinerPage.getByRole('region', {
      name: 'In-call chat',
    });
    await expect(starterCallChatPanel).toBeVisible();
    await expect(joinerCallChatPanel).toBeVisible();
    await expectRightPanelToResize(page, starterCallChatPanel, 'callChat');

    const messageResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/calls/') &&
        response.url().includes('/messages') &&
        response.status() === 200,
    );

    await starterCallChatPanel
      .getByPlaceholder('Send a message...')
      .fill(message);
    await starterCallChatPanel
      .getByPlaceholder('Send a message...')
      .press('Enter');
    await messageResponse;

    await expect(joinerCallChatPanel.getByText(message)).toBeVisible();
    await expect(
      joinerCallChatPanel.getByText(starter.user.name).first(),
    ).toBeVisible();
  } finally {
    if (joinerPage) {
      await leaveCallIfVisible(joinerPage);
    }
    await leaveCallIfVisible(page);
    await joinerContext.close();
  }
});
