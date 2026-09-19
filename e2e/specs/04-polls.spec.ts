import { readFile } from 'node:fs/promises';
import {
  expect,
  test,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  seedAuthenticatedSession,
  setupAnonymousSession,
  signUpViaApi,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import { expectImageToLoad } from '../lib/images';
import { createInvite } from '../lib/invites';
import { scrollThroughAllPages } from '../lib/infinite-scroll';
import {
  confirmRatifyingVote,
  expirePollDeadline,
  getPollVoteSummary,
  makeProposalsRatifyWithOneAgreeVote,
  openCreatePollDialog,
  openCreateProposalDialog,
  pollCard,
  selectRadixOption,
  shortenNextPollDuration,
  voteViaApi,
} from '../lib/polls';
import { createMessages } from '../lib/messages';
import { getAdminServerRole, getServerRole } from '../lib/server-roles';
import {
  createServer,
  createServerAdmin,
  getDefaultServer,
  getServerBySlug,
  joinServer,
  updateServerConfig,
} from '../lib/servers';
import { minutesUntil, secondsUntil } from '../lib/time';
import { ChatPage } from '../pages/chat.page';

type PollResponse = {
  poll: {
    id: string;
    body?: string | null;
    pollType: string;
    config: {
      closingAt?: string | null;
      multipleChoice?: boolean | null;
    };
    options: {
      id: string;
      text: string;
      voteCount: number;
    }[];
    images: { id: string }[];
  };
};

const changedRoleColor = '#2196f3';
const activeDecisionsPageSize = 10;
const channelFeedPageSize = 20;
const totalActiveDecisions = 41;

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('authenticated user can create and vote in a poll', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('poll'),
  );
  const server = await getDefaultServer(request, authenticatedUser);
  const question = `Where should we meet ${authenticatedUser.user.suffix}?`;
  const options = [
    `Library ${authenticatedUser.user.suffix}`,
    `Cafe ${authenticatedUser.user.suffix}`,
    `Park ${authenticatedUser.user.suffix}`,
  ];

  const chat = new ChatPage(page);
  await chat.goto();
  await chat.expectChannel('general');

  await openCreatePollDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a Poll' });

  await dialog
    .getByPlaceholder('What question do you want to ask?')
    .fill(question);
  await dialog.getByPlaceholder('Answer 1').fill(options[0]);
  await dialog.getByPlaceholder('Answer 2').fill(options[1]);
  await dialog.getByRole('button', { name: 'Add another answer' }).click();
  await dialog.getByPlaceholder('Answer 3').fill(options[2]);
  await dialog.getByRole('combobox', { name: 'Duration' }).click();
  await page.getByRole('option', { name: '30 minutes' }).click();

  const createPollResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create poll' }).click();
  const response = await createPollResponse;
  const { poll } = (await response.json()) as PollResponse;

  expect(poll.body).toBe(question);
  expect(poll.pollType).toBe('poll');
  expect(poll.options.map((option) => option.text)).toEqual(options);
  expect(poll.config.multipleChoice).toBe(false);
  expect(poll.config.closingAt).toBeTruthy();
  expect(minutesUntil(poll.config.closingAt!)).toBeGreaterThanOrEqual(29);
  expect(minutesUntil(poll.config.closingAt!)).toBeLessThanOrEqual(30);

  await expect(dialog).toBeHidden();
  const createdPoll = page
    .getByTestId('feed')
    .locator(`[data-decision-id="${poll.id}"]`);
  await expect(createdPoll.getByText(question)).toBeVisible();
  for (const option of options) {
    await expect(createdPoll.getByText(option)).toBeVisible();
  }
  await expect(createdPoll.getByText('Ends in 30 minutes')).toBeVisible();

  const threadReply = `Poll reply ${authenticatedUser.user.suffix}`;
  await createdPoll.getByRole('button', { name: 'Open poll menu' }).click();
  await page.getByRole('menuitem', { name: 'Reply' }).click();
  const threadPanel = page.getByTestId('thread-panel');
  await expect(threadPanel.getByText(question)).toBeVisible();
  await expect(page).toHaveURL(
    new RegExp(`thread=${poll.id}.*threadKind=poll`),
  );
  const replyResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/polls/${poll.id}/replies`) &&
      response.status() === 200,
  );
  await threadPanel.getByPlaceholder('Reply to thread...').fill(threadReply);
  await threadPanel.getByPlaceholder('Reply to thread...').press('Enter');
  await replyResponse;
  await expect(threadPanel.getByText(threadReply)).toBeVisible();
  await expect(createdPoll.getByText('1 reply')).toBeVisible();
  await threadPanel.getByRole('button', { name: 'Close thread' }).click();
  await expect(threadPanel).toBeHidden();

  const activeDecision = page
    .getByRole('complementary', { name: 'Active decisions' })
    .getByRole('link', { name: 'Open poll in general' })
    .filter({ hasText: question });
  await expect(activeDecision).toBeVisible();

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/polls/${poll.id}/votes`) &&
      response.status() === 200,
  );
  await createdPoll.getByRole('button', { name: options[1] }).click();
  await createdPoll.getByRole('button', { name: 'Vote', exact: true }).click();
  await voteResponse;

  await expect(
    createdPoll.getByRole('button', { name: 'Remove vote' }),
  ).toBeVisible();
  await expect(createdPoll.getByText('1 vote').first()).toBeVisible();
  await expect(activeDecision.getByText('Responded')).toBeVisible();
  await expect(activeDecision.getByText(/^1\/\d+$/)).toBeVisible();
});

test('authenticated user can create a proposal with an image attachment', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('proposal-image'),
  );
  const server = await getDefaultServer(request, authenticatedUser);
  const proposalBody = `Proposal image ${authenticatedUser.user.suffix}`;

  const chat = new ChatPage(page);
  await chat.goto();
  await chat.expectChannel('general');
  await openCreateProposalDialog(page);

  const dialog = page.getByRole('dialog', {
    name: 'Create a New Proposal',
  });
  await selectRadixOption(dialog, page, 'Select an action type', 'Test');
  await dialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await expect(
    dialog.getByText('Attached images', { exact: true }),
  ).toHaveCount(0);

  await dialog
    .getByTestId('image-input')
    .setInputFiles('e2e/fixtures/valid-image.png');
  await expect(
    dialog.getByText('Attached images', { exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Next' }).click();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create proposal' }).click();
  const response = await createProposalResponse;
  const { poll } = (await response.json()) as PollResponse;

  expect(response.request().headers()['content-type']).toContain(
    'multipart/form-data',
  );
  expect(poll.images).toHaveLength(1);
  await expect(dialog).toBeHidden();

  let proposal = page.locator(`[data-decision-id="${poll.id}"]`);
  await expect(proposal.getByText(proposalBody)).toBeVisible();
  await expectImageToLoad(
    proposal.getByRole('img', { name: 'Attached image' }),
  );

  await page.reload();
  proposal = page.locator(`[data-decision-id="${poll.id}"]`);
  await expect(proposal.getByText(proposalBody)).toBeVisible();
  await expectImageToLoad(
    proposal.getByRole('img', { name: 'Attached image' }),
  );
});

test('active decisions panel loads the next page when scrolled to the bottom', async ({
  context,
  page,
  request,
}) => {
  const expectedPageCount = Math.ceil(
    totalActiveDecisions / activeDecisionsPageSize,
  );
  test.setTimeout(Math.max(60_000, expectedPageCount * 15_000));
  expect(totalActiveDecisions).toBeGreaterThan(0);

  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('decision-scroll'),
  );
  const serverName = `Decision scroll ${authenticatedUser.user.suffix}`;
  const serverSlug = `decision-scroll-${authenticatedUser.user.suffix}`;
  const serverAdmin = await createServerAdmin(request, 'decision-scroll-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: serverName,
    slug: serverSlug,
    description: 'Server for active decision pagination.',
  });
  const decisionScrollInvite = await createInvite(
    request,
    serverAdmin,
    createdServer.id,
  );
  await joinServer(
    request,
    authenticatedUser,
    createdServer.id,
    decisionScrollInvite,
  );

  const getServerResponse = await request.get(
    `/api/servers/slug/${serverSlug}`,
    { headers: authorizationHeaders(authenticatedUser) },
  );
  await expect(getServerResponse).toBeOK();
  const { server } = (await getServerResponse.json()) as {
    server: {
      id: string;
      slug: string;
      generalChannelId: string;
    };
  };
  expect(server.generalChannelId).toBeTruthy();

  const decisionBodies = Array.from(
    { length: totalActiveDecisions },
    (_, index) =>
      `Infinite scroll decision ${String(index + 1).padStart(2, '0')} ${
        authenticatedUser.user.suffix
      }`,
  );

  for (const [index, body] of decisionBodies.entries()) {
    const createPollResponse = await request.post(
      `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
      {
        headers: authorizationHeaders(authenticatedUser),
        data: {
          body,
          pollType: 'poll',
          options: ['Yes', 'No'],
          multipleChoice: false,
          closingAt: new Date(
            Date.now() + (index + 1) * 60 * 60 * 1000,
          ).toISOString(),
        },
      },
    );
    await expect(createPollResponse).toBeOK();
  }

  await page.setViewportSize({ width: 1180, height: 720 });
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(
    page.getByRole('link', { name: 'general', exact: true }),
  ).toBeVisible();

  const firstPageResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.pathname === `/api/servers/${server.id}/decisions` &&
      !url.searchParams.has('before') &&
      url.searchParams.get('limit') === String(activeDecisionsPageSize) &&
      response.status() === 200
    );
  });
  await page.getByRole('button', { name: 'Toggle active decisions' }).click();
  await firstPageResponse;

  const panel = page.getByRole('complementary', {
    name: 'Active decisions',
  });
  const finalDecision = decisionBodies.at(-1)!;
  await expect(panel.getByText(decisionBodies[0])).toBeVisible();
  if (totalActiveDecisions > activeDecisionsPageSize) {
    await expect(panel.getByText(finalDecision)).toHaveCount(0);

    const decisionsList = panel.getByTestId('active-decisions-list');
    await scrollThroughAllPages({
      page,
      scrollContainer: decisionsList,
      pageSize: activeDecisionsPageSize,
      totalItems: totalActiveDecisions,
      direction: 'down',
      matchesPageResponse: (response) => {
        const url = new URL(response.url());
        return (
          response.request().method() === 'GET' &&
          url.pathname === `/api/servers/${server.id}/decisions` &&
          url.searchParams.has('before') &&
          url.searchParams.get('limit') === String(activeDecisionsPageSize) &&
          response.status() === 200
        );
      },
      onPageLoaded: async (loadedItemCount) => {
        const lastDecisionOnPage =
          decisionBodies[
            Math.min(
              loadedItemCount + activeDecisionsPageSize,
              totalActiveDecisions,
            ) - 1
          ];
        await expect(panel.getByText(lastDecisionOnPage)).toBeVisible();
      },
    });
  }

  await expect(panel.getByText(finalDecision)).toBeVisible();
});

test('invite holder can read active decisions in a non-default server', async ({
  context,
  page,
  request,
}) => {
  const admin = await createServerAdmin(request, 'invite-decisions-admin');
  const serverSlug = `invite-decisions-${admin.user.suffix}`;
  await createServer(request, admin, {
    name: `Invite decisions ${admin.user.suffix}`,
    slug: serverSlug,
    description: 'Non-default server for invite decision access.',
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

  const decisionBody = `Invited decision ${admin.user.suffix}`;
  const createPollResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(admin),
      data: {
        body: decisionBody,
        pollType: 'poll',
        options: ['Yes', 'No'],
        multipleChoice: false,
        closingAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    },
  );
  await expect(createPollResponse).toBeOK();

  const inviteToken = await createInvite(request, admin, server.id);
  await context.addInitScript((token) => {
    window.localStorage.removeItem('access_token');
    window.localStorage.setItem('invite-token', token);
  }, inviteToken);

  await page.setViewportSize({ width: 1180, height: 720 });
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

  const decisionsResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === `/api/servers/${server.id}/decisions`;
  });
  await page.getByRole('button', { name: 'Toggle active decisions' }).click();

  expect((await decisionsResponsePromise).status()).toBe(200);
  const panel = page.getByRole('complementary', {
    name: 'Active decisions',
  });
  await expect(panel.getByText(decisionBody)).toBeVisible();
});

test('invite holder can read proposals for all action types', async ({
  context,
  page,
  request,
}) => {
  const admin = await createServerAdmin(
    request,
    'invite-proposal-actions-admin',
  );
  const serverSlug = `invite-actions-${admin.user.suffix}`;
  await createServer(request, admin, {
    name: `Invite actions ${admin.user.suffix}`,
    slug: serverSlug,
    description: 'Non-default server for invited proposal action access.',
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
  const adminRole = await getAdminServerRole(request, admin, server.id);
  const proposalPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const bodies = {
    general: `Invited general proposal ${admin.user.suffix}`,
    changeSettings: `Invited settings proposal ${admin.user.suffix}`,
    changeRole: `Invited role change proposal ${admin.user.suffix}`,
    createRole: `Invited role creation proposal ${admin.user.suffix}`,
    planEvent: `Invited event proposal ${admin.user.suffix}`,
    test: `Invited test proposal ${admin.user.suffix}`,
  };
  const createdRoleName = `invite-reader-${admin.user.suffix}`;
  const eventName = `Invite event ${admin.user.suffix}`;
  const eventDescription = 'Event details visible to an invite holder.';
  const eventStartsAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);

  const createProposal = async (
    body: string,
    action: Record<string, unknown>,
  ) => {
    const response = await request.post(proposalPath, {
      headers: authorizationHeaders(admin),
      data: { body, pollType: 'proposal', action },
    });
    await expect(response).toBeOK();
  };

  await createProposal(bodies.general, { actionType: 'general' });
  await createProposal(bodies.changeSettings, {
    actionType: 'change-settings',
    serverConfig: { anonymousUsersEnabled: true },
  });
  await createProposal(bodies.changeRole, {
    actionType: 'change-role',
    serverRole: {
      serverRoleToUpdateId: adminRole.id,
      permissions: [
        {
          subject: 'ServerConfig',
          actions: [{ action: 'manage', changeType: 'remove' }],
        },
      ],
    },
  });
  await createProposal(bodies.createRole, {
    actionType: 'create-role',
    serverRole: {
      name: createdRoleName,
      color: changedRoleColor,
      permissions: [
        {
          subject: 'Channel',
          actions: [{ action: 'manage', changeType: 'add' }],
        },
      ],
    },
  });
  await createProposal(bodies.test, { actionType: 'test' });

  const planEventPayload = {
    body: bodies.planEvent,
    pollType: 'proposal',
    action: {
      actionType: 'plan-event',
      event: {
        name: eventName,
        description: eventDescription,
        startsAt: eventStartsAt.toISOString(),
        online: true,
        hostIds: [admin.userId],
      },
    },
  };
  const createPlanEventResponse = await request.post(proposalPath, {
    headers: authorizationHeaders(admin),
    multipart: {
      payload: JSON.stringify(planEventPayload),
      file: {
        name: 'valid-image.png',
        mimeType: 'image/png',
        buffer: await readFile('e2e/fixtures/valid-image.png'),
      },
    },
  });
  await expect(createPlanEventResponse).toBeOK();

  const inviteToken = await createInvite(request, admin, server.id);
  await context.addInitScript((token) => {
    window.localStorage.removeItem('access_token');
    window.localStorage.setItem('invite-token', token);
  }, inviteToken);

  const roleResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === `/api/servers/${server.id}/roles/${adminRole.id}` &&
      response.request().method() === 'GET'
    );
  });
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

  expect((await roleResponsePromise).status()).toBe(200);

  const generalProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${bodies.general}`,
  });
  await expect(generalProposal.getByText('General decision')).toBeVisible();

  const settingsProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${bodies.changeSettings}`,
  });
  await expect(settingsProposal.getByText('Change settings')).toBeVisible();
  await settingsProposal
    .getByRole('button', { name: 'Settings change proposal: 1 setting change' })
    .click();
  await expect(settingsProposal.getByText('Anonymous users')).toBeVisible();
  await expect(settingsProposal.getByText('Enabled')).toBeVisible();

  const roleChangeProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${bodies.changeRole}`,
  });
  await expect(roleChangeProposal.getByText('Change role')).toBeVisible();
  await roleChangeProposal
    .getByRole('button', { name: 'Role change proposal: admin' })
    .click();
  await expect(roleChangeProposal.getByText('Manage settings')).toBeVisible();

  const roleCreationProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${bodies.createRole}`,
  });
  await expect(roleCreationProposal.getByText('Create role')).toBeVisible();
  await roleCreationProposal
    .getByRole('button', { name: `Role proposal: ${createdRoleName}` })
    .click();
  await expect(roleCreationProposal.getByText('Manage channels')).toBeVisible();

  const eventProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${bodies.planEvent}`,
  });
  await expect(eventProposal.getByText('Plan event')).toBeVisible();
  const eventTrigger = eventProposal.getByRole('button', {
    name: `Planned event: ${eventName}`,
  });
  const coverResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/event-cover-photos/'),
  );
  await eventTrigger.scrollIntoViewIfNeeded();
  await expectImageToLoad(
    eventTrigger.getByRole('img', { name: 'Cover photo' }),
  );
  expect((await coverResponsePromise).status()).toBe(200);
  await eventTrigger.click();
  await expect(eventProposal.getByText(eventDescription)).toBeVisible();

  const testProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${bodies.test}`,
  });
  await expect(testProposal.getByText('Test', { exact: true })).toBeVisible();
});

test('active decision opens fully in view across channels and feed pages', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('decision-focus'),
  );
  const serverSlug = `decision-focus-${authenticatedUser.user.suffix}`;
  const serverAdmin = await createServerAdmin(request, 'decision-focus-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Decision focus ${authenticatedUser.user.suffix}`,
    slug: serverSlug,
    description: 'Server for active decision feed focus.',
  });
  const decisionFocusInvite = await createInvite(
    request,
    serverAdmin,
    createdServer.id,
  );
  await joinServer(
    request,
    authenticatedUser,
    createdServer.id,
    decisionFocusInvite,
  );

  const getServerResponse = await request.get(
    `/api/servers/slug/${serverSlug}`,
    { headers: authorizationHeaders(authenticatedUser) },
  );
  await expect(getServerResponse).toBeOK();
  const { server } = (await getServerResponse.json()) as {
    server: {
      id: string;
      slug: string;
      generalChannelId: string;
    };
  };
  const otherChannelName = `decision-start-${authenticatedUser.user.suffix}`;
  const createChannelResponse = await request.post(
    `/api/servers/${server.id}/channels`,
    {
      headers: authorizationHeaders(serverAdmin),
      data: {
        name: otherChannelName,
        description: 'Starting channel for decision focus navigation.',
        channelType: 'text',
      },
    },
  );
  await expect(createChannelResponse).toBeOK();
  const { channel: otherChannel } = (await createChannelResponse.json()) as {
    channel: { id: string };
  };

  const decisionBody = `Focused decision ${authenticatedUser.user.suffix}`;
  const createPollResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(authenticatedUser),
      data: {
        body: decisionBody,
        pollType: 'poll',
        options: ['Strong yes', 'Yes', 'Neutral', 'No', 'Strong no'],
        multipleChoice: false,
        closingAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    },
  );
  await expect(createPollResponse).toBeOK();
  const { poll } = (await createPollResponse.json()) as PollResponse;

  await createMessages({
    request,
    user: authenticatedUser,
    serverId: server.id,
    channelId: server.generalChannelId,
    bodies: Array.from(
      { length: channelFeedPageSize * 2 },
      (_, index) =>
        `Newer focus message ${index + 1} ${authenticatedUser.user.suffix}`,
    ),
  });

  await page.addInitScript(() => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const scrollCalls: string[] = [];
    (
      window as Window & { __decisionScrollCalls?: string[] }
    ).__decisionScrollCalls = scrollCalls;
    Element.prototype.scrollIntoView = function (
      options?: boolean | ScrollIntoViewOptions,
    ) {
      if (this instanceof HTMLElement && this.dataset.decisionId) {
        scrollCalls.push(this.dataset.decisionId);
      }
      originalScrollIntoView.call(this, options);
    };
  });
  await page.setViewportSize({ width: 1440, height: 720 });
  const feed = page.getByTestId('feed');
  await page.goto(`/s/${server.slug}/c/${otherChannel.id}`);
  await expect(page.locator('header')).toContainText(otherChannelName);

  const panel = page.getByRole('complementary', {
    name: 'Active decisions',
  });
  const feedPageCursors: string[] = [];
  const feedContextTargets: string[] = [];
  const recordFeedPageResponse = (response: Response) => {
    const url = new URL(response.url());
    const isChannelFeedPage =
      response.request().method() === 'GET' &&
      url.pathname ===
        `/api/servers/${server.id}/channels/${server.generalChannelId}/feed` &&
      response.status() === 200;
    if (!isChannelFeedPage) {
      return;
    }
    if (url.searchParams.has('around')) {
      feedContextTargets.push(url.searchParams.get('around')!);
    }
    if (
      url.searchParams.has('before') &&
      url.searchParams.get('limit') === String(channelFeedPageSize)
    ) {
      feedPageCursors.push(url.searchParams.get('before')!);
    }
  };
  page.on('response', recordFeedPageResponse);
  await panel
    .getByText(decisionBody, { exact: true })
    .locator('xpath=ancestor::a')
    .click();

  const focusedDecision = feed.locator(`[data-decision-id="${poll.id}"]`);
  await expect(focusedDecision).toBeFocused();
  page.off('response', recordFeedPageResponse);
  expect(feedContextTargets).toEqual([poll.id]);
  expect(feedPageCursors).toHaveLength(0);
  await expect(focusedDecision).toHaveAttribute('data-focus-highlight', 'true');
  await feed.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const fallback = window.setTimeout(resolve, 750);
        element.addEventListener(
          'scrollend',
          () => {
            window.clearTimeout(fallback);
            resolve();
          },
          { once: true },
        );
      }),
  );
  let consecutiveFullyVisibleChecks = 0;
  await expect
    .poll(
      async () => {
        const [feedBox, decisionBox] = await Promise.all([
          feed.boundingBox(),
          focusedDecision.boundingBox(),
        ]);
        if (!feedBox || !decisionBox) {
          consecutiveFullyVisibleChecks = 0;
          return consecutiveFullyVisibleChecks;
        }

        const decisionTop = decisionBox.y;
        const decisionBottom = decisionBox.y + decisionBox.height;
        const feedTop = feedBox.y;
        const feedBottom = feedBox.y + feedBox.height;
        const isFullyVisible =
          decisionTop >= feedTop && decisionBottom <= feedBottom;
        consecutiveFullyVisibleChecks = isFullyVisible
          ? consecutiveFullyVisibleChecks + 1
          : 0;
        return consecutiveFullyVisibleChecks;
      },
      { intervals: [100, 100, 100, 100, 100] },
    )
    .toBeGreaterThanOrEqual(3);

  // TODO: Remove this implementation-specific assertion if it proves brittle;
  // the visibility and focus assertions above already cover the user outcome
  const decisionScrollCalls = await page.evaluate(
    (decisionId) =>
      (
        (
          window as Window & {
            __decisionScrollCalls?: string[];
          }
        ).__decisionScrollCalls || []
      ).filter((scrollDecisionId) => scrollDecisionId === decisionId).length,
    poll.id,
  );

  expect(decisionScrollCalls).toBe(1);
  await expect(focusedDecision).not.toHaveAttribute(
    'data-focus-highlight',
    'true',
  );
});

test('authenticated user sees a poll close after its closing time passes', async ({
  context,
  page,
  request,
}) => {
  const authenticatedUser = await createAuthenticatedUser(
    request,
    context,
    createTestUser('poll-close'),
  );
  const server = await getDefaultServer(request, authenticatedUser);
  const question = `Which snack wins ${authenticatedUser.user.suffix}?`;
  const options = [
    `Pretzels ${authenticatedUser.user.suffix}`,
    `Popcorn ${authenticatedUser.user.suffix}`,
  ];

  const chat = new ChatPage(page);
  await chat.goto();
  await chat.expectChannel('general');

  await openCreatePollDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a Poll' });

  await dialog
    .getByPlaceholder('What question do you want to ask?')
    .fill(question);
  await dialog.getByPlaceholder('Answer 1').fill(options[0]);
  await dialog.getByPlaceholder('Answer 2').fill(options[1]);
  await dialog.getByRole('combobox', { name: 'Duration' }).click();
  await page.getByRole('option', { name: '30 minutes' }).click();
  await shortenNextPollDuration(page, server.generalChannelId, 5);

  const createPollResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create poll' }).click();
  const response = await createPollResponse;
  const { poll } = (await response.json()) as PollResponse;

  expect(poll.config.closingAt).toBeTruthy();
  expect(secondsUntil(poll.config.closingAt!)).toBeLessThanOrEqual(6);

  await expect(dialog).toBeHidden();
  await expect(page.getByText(question).first()).toBeVisible();

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/polls/${poll.id}/votes`) &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: options[1] }).click();
  await page.getByRole('button', { name: 'Vote', exact: true }).first().click();
  await voteResponse;

  await expect(page.getByRole('button', { name: 'Remove vote' })).toBeVisible();
  await expect(page.getByText('1 vote').first()).toBeVisible();

  await expect
    .poll(
      async () => {
        await page.reload();
        await expect(page.getByText(question).first()).toBeVisible();
        return pollCard(page, question).getByText('Poll closed').isVisible();
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  const closedPoll = pollCard(page, question);
  await expect(closedPoll.getByText('Poll closed')).toBeVisible();
  await expect(
    closedPoll.getByRole('button', { name: 'Vote', exact: true }),
  ).toHaveCount(0);
  await expect(
    closedPoll.getByRole('button', { name: 'Remove vote' }),
  ).toHaveCount(0);
  await expect(closedPoll.getByText('1 vote').first()).toBeVisible();
});

test('anonymous user can create only allowed chat polls', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const { admin, server } = await setupAnonymousSession(
    request,
    context,
    'anon-poll',
  );
  const pollQuestion = `Anonymous poll ${admin.user.suffix}?`;
  const proposalBody = `Anonymous test proposal ${admin.user.suffix}`;
  const chat = new ChatPage(page);

  await chat.gotoExplore();
  await chat.expectChannel('general');

  await openCreatePollDialog(page, 'Create poll');
  const pollDialog = page.getByRole('dialog', { name: 'Create a Poll' });
  await pollDialog
    .getByPlaceholder('What question do you want to ask?')
    .fill(pollQuestion);
  await pollDialog.getByPlaceholder('Answer 1').fill('Yes');
  await pollDialog.getByPlaceholder('Answer 2').fill('No');

  const pollResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await pollDialog.getByRole('button', { name: 'Create poll' }).click();
  await pollResponse;
  await expect(pollDialog).toBeHidden();
  await expect(page.getByTestId('feed').getByText(pollQuestion)).toBeVisible();

  await openCreatePollDialog(page, 'Create proposal');
  const proposalDialog = page.getByRole('dialog', {
    name: 'Create a New Proposal',
  });
  await proposalDialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'General decision' }).click();
  await expect(
    proposalDialog.getByText(
      'Anonymous users can only create test proposals. Please register to create other proposal types.',
    ),
  ).toBeVisible();

  await proposalDialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Test' }).click();
  await proposalDialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await proposalDialog.getByRole('button', { name: 'Next' }).click();

  const proposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await proposalDialog.getByRole('button', { name: 'Create proposal' }).click();
  await proposalResponse;
  await expect(proposalDialog).toBeHidden();
  await expect(page.getByTestId('feed').getByText(proposalBody)).toBeVisible();
});

test('user can create and ratify a proposal to change a role', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'role-proposal-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Role proposal ${serverAdmin.user.suffix}`,
    slug: `role-proposal-${serverAdmin.user.suffix}`,
  });
  const roleProposalInvite = await createInvite(
    request,
    serverAdmin,
    createdServer.id,
  );
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('role-proposal'),
    roleProposalInvite,
  );
  const addedMember = await signUpViaApi(
    request,
    createTestUser('role-member'),
    roleProposalInvite,
  );

  const server = await getServerBySlug(request, proposer, createdServer.slug);
  await makeProposalsRatifyWithOneAgreeVote(request, serverAdmin, server.id);

  const adminRole = await getAdminServerRole(request, proposer, server.id);
  const changedRoleName = `admin-${proposer.user.suffix}`;
  const proposalBody = `Change the admin role ${proposer.user.suffix}`;

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  await openCreateProposalDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a New Proposal' });

  await selectRadixOption(dialog, page, 'Select an action type', 'Change role');
  await dialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await dialog.getByRole('button', { name: 'Next' }).click();

  await selectRadixOption(dialog, page, 'Select a role...', 'admin');
  await dialog.getByRole('button', { name: 'Next' }).click();

  await dialog.getByPlaceholder('Name').fill(changedRoleName);
  await dialog.getByRole('button', { name: /Role color/ }).click();
  await dialog
    .getByRole('button', { name: `Pick ${changedRoleColor}` })
    .click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  await dialog.getByRole('switch', { name: 'Manage settings' }).click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  await dialog
    .getByPlaceholder('Search members...')
    .fill(addedMember.user.name);
  await dialog.getByText(addedMember.user.name).click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  await expect(dialog.getByText(changedRoleName)).toBeVisible();
  await expect(dialog.getByText(changedRoleColor)).toBeVisible();
  await expect(dialog.getByText('Manage settings')).toBeVisible();
  await expect(dialog.getByText(addedMember.user.name)).toBeVisible();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create proposal' }).click();
  await createProposalResponse;

  await expect(dialog).toBeHidden();
  const proposal = page.getByRole('article', {
    name: `Majority Vote Proposal: ${proposalBody}`,
  });
  await expect(proposal).toBeVisible();
  await expect(proposal.getByText('Voting', { exact: true })).toBeVisible();

  const roleChanges = proposal.getByRole('button', {
    name: `Role change proposal: admin`,
  });
  await expect(roleChanges).toBeVisible();
  await roleChanges.click();
  const roleChangeDetails = proposal.getByLabel('Role change proposal: admin');
  await expect(
    roleChangeDetails.getByText('Name', { exact: true }),
  ).toBeVisible();
  await expect(
    roleChangeDetails.getByText('admin', { exact: true }),
  ).toBeVisible();
  await expect(
    proposal.getByText(changedRoleName, { exact: true }),
  ).toBeVisible();
  await expect(proposal.getByText('Color', { exact: true })).toBeVisible();
  await expect(
    proposal.getByText(adminRole.color, { exact: true }),
  ).toBeVisible();
  await expect(
    proposal.getByText(changedRoleColor, { exact: true }),
  ).toBeVisible();
  await expect(
    proposal.getByText('Manage settings', { exact: true }),
  ).toBeVisible();
  await expect(
    proposal.getByText(addedMember.user.name, { exact: true }),
  ).toBeVisible();

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/votes') &&
      response.status() === 200,
  );
  await proposal.getByRole('button', { name: 'Agree', exact: true }).click();
  await confirmRatifyingVote(page);
  await voteResponse;

  await expect(proposal.getByText('Ratified', { exact: true })).toBeVisible();

  const changedRole = await getServerRole(
    request,
    proposer,
    server.id,
    adminRole.id,
  );

  expect(changedRole.name).toBe(changedRoleName);
  expect(changedRole.color).toBe(changedRoleColor);
  expect(
    changedRole.permissions.some(
      (permission) =>
        permission.subject === 'ServerConfig' &&
        permission.action.includes('manage'),
    ),
  ).toBe(false);
  expect(changedRole.members.map((member) => member.id)).toContain(
    addedMember.userId,
  );
  expect(changedRole.members.map((member) => member.id)).toEqual(
    expect.arrayContaining(adminRole.members.map((member) => member.id)),
  );
});

test('user can create and ratify a proposal to change server settings', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(
    request,
    'settings-proposal-admin',
  );
  const createdServer = await createServer(request, serverAdmin, {
    name: `Settings proposal ${serverAdmin.user.suffix}`,
    slug: `settings-proposal-${serverAdmin.user.suffix}`,
  });
  const settingsProposalInvite = await createInvite(
    request,
    serverAdmin,
    createdServer.id,
  );
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('settings-proposal'),
    settingsProposalInvite,
  );
  const server = await getServerBySlug(request, proposer, createdServer.slug);
  await makeProposalsRatifyWithOneAgreeVote(request, serverAdmin, server.id);
  await updateServerConfig(request, serverAdmin, server.id, {
    anonymousUsersEnabled: false,
  });

  const proposalBody = `Enable anonymous users ${proposer.user.suffix}`;
  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  await openCreateProposalDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a New Proposal' });
  await selectRadixOption(
    dialog,
    page,
    'Select an action type',
    'Change settings',
  );
  await dialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await dialog.getByRole('button', { name: 'Next' }).click();

  await expect(
    dialog.getByRole('combobox', { name: 'Decision making model' }),
  ).toContainText('Majority vote');
  await expect(
    dialog.getByRole('combobox', { name: 'Disagreements limit' }),
  ).toContainText('2');
  await expect(
    dialog.getByRole('combobox', { name: 'Voting time limit' }),
  ).toContainText('Unlimited');
  await dialog.getByRole('button', { name: 'Next' }).click();
  await expect(
    dialog.getByText('Change settings proposals require at least one change.'),
  ).toBeVisible();
  await dialog.getByRole('switch', { name: 'Anonymous users' }).click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  await expect(
    dialog.getByText('Anonymous users', { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText('Disabled', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Enabled', { exact: true })).toBeVisible();

  await dialog.getByRole('button', { name: 'Previous' }).click();
  await expect(
    dialog.getByRole('switch', { name: 'Anonymous users' }),
  ).toBeChecked();
  await dialog.getByRole('button', { name: 'Next' }).click();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create proposal' }).click();
  await createProposalResponse;

  const proposal = page.getByRole('article', {
    name: `Majority Vote Proposal: ${proposalBody}`,
  });
  const settingsChanges = proposal.getByRole('button', {
    name: 'Settings change proposal: 1 setting change',
  });
  await expect(settingsChanges).toBeVisible();
  await settingsChanges.click();
  await expect(
    proposal.getByText('Anonymous users', { exact: true }),
  ).toBeVisible();
  await expect(proposal.getByText('Disabled', { exact: true })).toBeVisible();
  await expect(proposal.getByText('Enabled', { exact: true })).toBeVisible();

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/votes') &&
      response.status() === 200,
  );
  await proposal.getByRole('button', { name: 'Agree', exact: true }).click();
  await confirmRatifyingVote(page);
  await voteResponse;
  await expect(proposal.getByText('Ratified', { exact: true })).toBeVisible();

  const configResponse = await request.get(
    `/api/servers/${server.id}/configs`,
    { headers: { Authorization: `Bearer ${proposer.accessToken}` } },
  );
  await expect(configResponse).toBeOK();
  const config = (await configResponse.json()) as {
    serverConfig: { anonymousUsersEnabled: boolean };
  };
  expect(config.serverConfig.anonymousUsersEnabled).toBe(true);
});

test('proposal votes require confirmation when ratifying or blocking', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'vote-confirmation');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Vote confirmation ${serverAdmin.user.suffix}`,
    slug: `vote-confirmation-${serverAdmin.user.suffix}`,
  });
  const server = await getServerBySlug(
    request,
    serverAdmin,
    createdServer.slug,
  );
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    quorumEnabled: false,
    disagreementsLimit: 0,
    abstainsLimit: 0,
    votingTimeLimit: 0,
  });

  const proposalPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const createProposal = async (body: string) => {
    const response = await request.post(proposalPath, {
      headers: authorizationHeaders(serverAdmin),
      data: {
        body,
        pollType: 'proposal',
        action: { actionType: 'test' },
      },
    });
    await expect(response).toBeOK();
    const { poll } = (await response.json()) as PollResponse;
    return poll;
  };

  const ratifyingBody = `Ratifying confirmation ${serverAdmin.user.suffix}`;
  const blockingBody = `Blocking confirmation ${serverAdmin.user.suffix}`;
  const ratifyingPoll = await createProposal(ratifyingBody);
  const blockingPoll = await createProposal(blockingBody);

  await seedAuthenticatedSession(context, serverAdmin.accessToken);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);

  const ratifyingProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${ratifyingBody}`,
  });
  await ratifyingProposal
    .getByRole('button', { name: 'Agree', exact: true })
    .click();

  const ratifyingDialog = page.getByRole('dialog', {
    name: 'Your vote may ratify this proposal',
  });
  await expect(ratifyingDialog).toBeVisible();
  await expect(
    ratifyingDialog.getByText(
      'Based on the current vote count, this vote is likely to ratify the proposal and put its action into effect.',
    ),
  ).toBeVisible();
  await ratifyingDialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(ratifyingDialog).toBeHidden();
  expect(getPollVoteSummary(ratifyingPoll.id)).toBe('0:none');

  await ratifyingProposal
    .getByRole('button', { name: 'Agree', exact: true })
    .click();
  const ratifyingVoteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/polls/${ratifyingPoll.id}/votes`) &&
      response.status() === 200,
  );
  await ratifyingDialog
    .getByRole('button', { name: 'Cast ratifying vote' })
    .click();
  await ratifyingVoteResponse;
  await expect(
    ratifyingProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();

  const blockingProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${blockingBody}`,
  });
  await blockingProposal
    .getByRole('button', { name: 'Block', exact: true })
    .click();

  const blockingDialog = page.getByRole('dialog', {
    name: 'Confirm blocking vote',
  });
  await expect(blockingDialog).toBeVisible();
  await expect(
    blockingDialog.getByText(
      'A blocking vote prevents this proposal from ratifying. Only continue if you intend to stop the proposal from passing.',
    ),
  ).toBeVisible();
  await blockingDialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(blockingDialog).toBeHidden();
  expect(getPollVoteSummary(blockingPoll.id)).toBe('0:none');

  await blockingProposal
    .getByRole('button', { name: 'Block', exact: true })
    .click();
  const blockingVoteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/polls/${blockingPoll.id}/votes`) &&
      response.status() === 200,
  );
  await blockingDialog
    .getByRole('button', { name: 'Cast blocking vote' })
    .click();
  await blockingVoteResponse;
  await expect(
    blockingProposal.getByRole('button', {
      name: 'Voting · Limit reached',
    }),
  ).toBeVisible();
});

test('majority vote distinguishes a tie from a winning majority', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'majority-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Majority decisions ${serverAdmin.user.suffix}`,
    slug: `majority-decisions-${serverAdmin.user.suffix}`,
  });
  const invite = await createInvite(request, serverAdmin, createdServer.id);
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('majority-proposer'),
    invite,
  );
  const supporter = await signUpViaApi(
    request,
    createTestUser('majority-supporter'),
    invite,
  );
  const dissenter = await signUpViaApi(
    request,
    createTestUser('majority-dissenter'),
    invite,
  );
  const server = await getServerBySlug(request, proposer, createdServer.slug);
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'majority-vote',
    agreementThreshold: 51,
    quorumEnabled: false,
    votingTimeLimit: 30,
    anonymousUsersEnabled: false,
  });

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  const tiedBody = `Tied majority ${proposer.user.suffix}`;
  const tiedPoll = await createTestProposal(
    page,
    server.generalChannelId,
    tiedBody,
  );
  const winningBody = `Winning majority ${proposer.user.suffix}`;
  const winningPoll = await createTestProposal(
    page,
    server.generalChannelId,
    winningBody,
  );

  const tiedProposal = page.getByRole('article', {
    name: `Majority Vote Proposal: ${tiedBody}`,
  });
  const winningProposal = page.getByRole('article', {
    name: `Majority Vote Proposal: ${winningBody}`,
  });
  await expect(tiedProposal).toBeVisible();
  await expect(winningProposal).toBeVisible();
  await expect(
    winningProposal.getByText('Majority vote', { exact: true }),
  ).toBeVisible();
  await expect(
    winningProposal.getByRole('button', { name: 'Block', exact: true }),
  ).toHaveCount(0);

  await voteViaApi(
    request,
    supporter,
    server.id,
    server.generalChannelId,
    tiedPoll.id,
    'agree',
  );
  await voteViaApi(
    request,
    dissenter,
    server.id,
    server.generalChannelId,
    tiedPoll.id,
    'disagree',
  );
  await voteViaApi(
    request,
    proposer,
    server.id,
    server.generalChannelId,
    winningPoll.id,
    'disagree',
  );
  await voteViaApi(
    request,
    supporter,
    server.id,
    server.generalChannelId,
    winningPoll.id,
    'agree',
  );
  await voteViaApi(
    request,
    dissenter,
    server.id,
    server.generalChannelId,
    winningPoll.id,
    'agree',
  );

  await expect(tiedProposal.getByText('Voting', { exact: true })).toBeVisible();
  await expect(
    winningProposal.getByText('Voting', { exact: true }),
  ).toBeVisible();

  expirePollDeadline(tiedPoll.id);
  expirePollDeadline(winningPoll.id);

  await expect(tiedProposal.getByText('Closed', { exact: true })).toBeVisible();
  await expect(
    winningProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();
});

test('consensus enforces quorum, limits, and blocks at its deadline', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'consensus-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Consensus decisions ${serverAdmin.user.suffix}`,
    slug: `consensus-decisions-${serverAdmin.user.suffix}`,
  });
  const invite = await createInvite(request, serverAdmin, createdServer.id);
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('consensus-proposer'),
    invite,
  );
  const supporter = await signUpViaApi(
    request,
    createTestUser('consensus-supporter'),
    invite,
  );
  const thirdVoter = await signUpViaApi(
    request,
    createTestUser('consensus-third-voter'),
    invite,
  );
  const server = await getServerBySlug(request, proposer, createdServer.slug);
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    quorumEnabled: true,
    quorumThreshold: 75,
    disagreementsLimit: 1,
    abstainsLimit: 1,
    blocksOpenToAll: true,
    votingTimeLimit: 30,
    anonymousUsersEnabled: false,
  });

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  const blockedBody = `Blocked consensus ${proposer.user.suffix}`;
  const blockedPoll = await createTestProposal(
    page,
    server.generalChannelId,
    blockedBody,
  );
  const ratifiedBody = `Ratified consensus ${proposer.user.suffix}`;
  const ratifiedPoll = await createTestProposal(
    page,
    server.generalChannelId,
    ratifiedBody,
  );

  const blockedProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${blockedBody}`,
  });
  const ratifiedProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${ratifiedBody}`,
  });
  await expect(blockedProposal).toBeVisible();
  await expect(ratifiedProposal).toBeVisible();

  for (const poll of [blockedPoll, ratifiedPoll]) {
    await voteViaApi(
      request,
      supporter,
      server.id,
      server.generalChannelId,
      poll.id,
      'agree',
    );
    await voteViaApi(
      request,
      thirdVoter,
      server.id,
      server.generalChannelId,
      poll.id,
      'agree',
    );
  }
  await voteViaApi(
    request,
    proposer,
    server.id,
    server.generalChannelId,
    blockedPoll.id,
    'block',
  );
  await voteViaApi(
    request,
    proposer,
    server.id,
    server.generalChannelId,
    ratifiedPoll.id,
    'abstain',
  );

  await expect(
    blockedProposal.getByText('Voting', { exact: true }),
  ).toBeVisible();
  await expect(
    ratifiedProposal.getByText('Voting', { exact: true }),
  ).toBeVisible();

  expirePollDeadline(blockedPoll.id);
  expirePollDeadline(ratifiedPoll.id);

  await expect(
    blockedProposal.getByText('Closed', { exact: true }),
  ).toBeVisible();
  await blockedProposal.getByRole('button', { name: /^\d+ votes?$/ }).click();
  const closedProgressDialog = page.getByRole('dialog', {
    name: 'Vote Progress',
  });
  await expect(
    closedProgressDialog.getByText(/Failed conditions/),
  ).toContainText('block present');
  await page.keyboard.press('Escape');
  await expect(closedProgressDialog).toBeHidden();
  await expect(
    ratifiedProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();
});

test('votes from removed members stop counting toward a proposal outcome', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'departed-vote-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Departed votes ${serverAdmin.user.suffix}`,
    slug: `departed-votes-${serverAdmin.user.suffix}`,
  });
  const invite = await createInvite(request, serverAdmin, createdServer.id);
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('departed-vote-proposer'),
    invite,
  );
  const departed = await signUpViaApi(
    request,
    createTestUser('departed-voter'),
    invite,
  );
  const voter = await signUpViaApi(
    request,
    createTestUser('remaining-voter'),
    invite,
  );
  const server = await getServerBySlug(request, proposer, createdServer.slug);
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    quorumEnabled: false,
    disagreementsLimit: 2,
    abstainsLimit: 2,
    blocksOpenToAll: true,
    votingTimeLimit: 0,
    anonymousUsersEnabled: false,
  });

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  const body = `Departed vote ${proposer.user.suffix}`;
  const poll = await createTestProposal(page, server.generalChannelId, body);
  const proposal = page.getByRole('article', {
    name: `Consensus Proposal: ${body}`,
  });
  await expect(proposal).toBeVisible();

  await voteViaApi(
    request,
    departed,
    server.id,
    server.generalChannelId,
    poll.id,
    'disagree',
  );
  const removeMemberResponse = await request.delete(
    `/api/servers/${server.id}/members`,
    {
      headers: authorizationHeaders(serverAdmin),
      data: { userIds: [departed.userId] },
    },
  );
  await expect(removeMemberResponse).toBeOK();

  await voteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    poll.id,
    'agree',
  );

  await expect(proposal.getByText('Ratified', { exact: true })).toBeVisible();
});

test('consensus proposals ratify when quorum is disabled', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'no-quorum-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `No quorum consensus ${serverAdmin.user.suffix}`,
    slug: `no-quorum-consensus-${serverAdmin.user.suffix}`,
  });
  const invite = await createInvite(request, serverAdmin, createdServer.id);
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('no-quorum-proposer'),
    invite,
  );
  const supporter = await signUpViaApi(
    request,
    createTestUser('no-quorum-supporter'),
    invite,
  );
  await signUpViaApi(request, createTestUser('no-quorum-bystander'), invite);
  const server = await getServerBySlug(request, proposer, createdServer.slug);
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    quorumEnabled: false,
    quorumThreshold: 75,
    disagreementsLimit: 0,
    abstainsLimit: 0,
    blocksOpenToAll: true,
    votingTimeLimit: 0,
    anonymousUsersEnabled: false,
  });

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  const body = `No quorum consensus ${proposer.user.suffix}`;
  const poll = await createTestProposal(page, server.generalChannelId, body);
  const proposal = page.getByRole('article', {
    name: `Consensus Proposal: ${body}`,
  });
  await expect(proposal.getByText('Voting', { exact: true })).toBeVisible();

  await voteViaApi(
    request,
    supporter,
    server.id,
    server.generalChannelId,
    poll.id,
    'agree',
  );

  await expect(proposal.getByText('Ratified', { exact: true })).toBeVisible();

  await updateServerConfig(request, serverAdmin, server.id, {
    votingTimeLimit: 30,
  });
  const deadlineBody = `No quorum consensus deadline ${proposer.user.suffix}`;
  const deadlinePoll = await createTestProposal(
    page,
    server.generalChannelId,
    deadlineBody,
  );
  const deadlineProposal = page.getByRole('article', {
    name: `Consensus Proposal: ${deadlineBody}`,
  });

  await voteViaApi(
    request,
    supporter,
    server.id,
    server.generalChannelId,
    deadlinePoll.id,
    'agree',
  );
  await expect(
    deadlineProposal.getByText('Voting', { exact: true }),
  ).toBeVisible();

  expirePollDeadline(deadlinePoll.id);

  await expect(
    deadlineProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();
});

test('consent settings disable quorum and agreement threshold and require a deadline', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'consent-settings');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Consent settings ${serverAdmin.user.suffix}`,
    slug: `consent-settings-${serverAdmin.user.suffix}`,
  });
  await seedAuthenticatedSession(context, serverAdmin.accessToken);
  await updateServerConfig(request, serverAdmin, createdServer.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    quorumEnabled: true,
    quorumThreshold: 25,
    votingTimeLimit: 0,
  });

  await page.goto(`/s/${createdServer.slug}/settings/proposals`);
  const durationSelect = page.getByRole('combobox', {
    name: 'Voting time limit',
  });
  await expect(durationSelect).toContainText('Unlimited');

  await page.getByRole('combobox', { name: 'Decision making model' }).click();
  await page.getByRole('option', { name: 'Consent', exact: true }).click();

  // Consent is only decided at a deadline, so the form must steer off
  // Unlimited and stop offering it
  await expect(durationSelect).not.toContainText('Unlimited');
  await durationSelect.click();
  await expect(page.getByRole('option', { name: 'Unlimited' })).toHaveCount(0);
  await page.getByRole('option', { name: '1 day', exact: true }).click();

  await expect(
    page.getByRole('spinbutton', { name: 'Agreement threshold' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('switch', { name: 'Require quorum' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('spinbutton', { name: 'Quorum threshold' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('combobox', { name: 'Disagreements limit' }),
  ).toBeEnabled();
  await expect(
    page.getByRole('combobox', { name: 'Abstains limit' }),
  ).toBeEnabled();

  const saveResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().includes(`/servers/${createdServer.id}/configs`) &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await saveResponse;

  const configResponse = await request.get(
    `/api/servers/${createdServer.id}/configs`,
    { headers: authorizationHeaders(serverAdmin) },
  );
  await expect(configResponse).toBeOK();
  const { serverConfig } = (await configResponse.json()) as {
    serverConfig: { decisionMakingModel: string; votingTimeLimit: number };
  };
  expect(serverConfig.decisionMakingModel).toBe('consent');
  expect(serverConfig.votingTimeLimit).toBe(60 * 24);
});

test('consent proposals are decided only at their deadline', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'consent-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Consent decisions ${serverAdmin.user.suffix}`,
    slug: `consent-decisions-${serverAdmin.user.suffix}`,
  });
  const consentInvite = await createInvite(
    request,
    serverAdmin,
    createdServer.id,
  );
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('consent-proposer'),
    consentInvite,
  );
  const objector = await signUpViaApi(
    request,
    createTestUser('consent-objector'),
    consentInvite,
  );
  const blocker = await signUpViaApi(
    request,
    createTestUser('consent-blocker'),
    consentInvite,
  );
  const server = await getServerBySlug(request, proposer, createdServer.slug);

  // Quorum is enabled and unreachable on purpose: consent must ignore it
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'consent',
    votingTimeLimit: 30,
    disagreementsLimit: 1,
    abstainsLimit: 1,
    quorumEnabled: true,
    quorumThreshold: 100,
    anonymousUsersEnabled: false,
  });

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  const blockedBody = `Blocked consent proposal ${proposer.user.suffix}`;
  const blockedPoll = await createTestProposal(
    page,
    server.generalChannelId,
    blockedBody,
  );
  expect(blockedPoll.config.closingAt).toBeTruthy();
  expect(minutesUntil(blockedPoll.config.closingAt!)).toBeGreaterThanOrEqual(
    29,
  );

  const blockedProposal = page.getByRole('article', {
    name: `Consent Proposal: ${blockedBody}`,
  });
  await expect(blockedProposal).toBeVisible();
  await expect(
    blockedProposal.getByText('Voting', { exact: true }),
  ).toBeVisible();

  await voteViaApi(
    request,
    objector,
    server.id,
    server.generalChannelId,
    blockedPoll.id,
    'agree',
  );
  await voteViaApi(
    request,
    blocker,
    server.id,
    server.generalChannelId,
    blockedPoll.id,
    'block',
  );
  // The block is visible immediately, but nothing finalizes before the
  // deadline
  await expect(
    blockedProposal.getByRole('button', { name: 'Voting · Limit reached' }),
  ).toBeVisible();

  const ratifiedBody = `Consented settings change ${proposer.user.suffix}`;
  const ratifiedPoll = await createSettingsProposal(
    page,
    server.generalChannelId,
    ratifiedBody,
  );
  const ratifiedProposal = page.getByRole('article', {
    name: `Consent Proposal: ${ratifiedBody}`,
  });
  await expect(ratifiedProposal).toBeVisible();

  // One disagreement and one abstention, each exactly at its limit
  await voteViaApi(
    request,
    objector,
    server.id,
    server.generalChannelId,
    ratifiedPoll.id,
    'disagree',
  );
  await voteViaApi(
    request,
    blocker,
    server.id,
    server.generalChannelId,
    ratifiedPoll.id,
    'abstain',
  );

  // Quorum is unmet, but consent ignores it entirely
  await ratifiedProposal.getByRole('button', { name: /^\d+ votes?$/ }).click();
  const progressDialog = page.getByRole('dialog', { name: 'Vote Progress' });
  await expect(progressDialog).toBeVisible();
  await expect(
    progressDialog.getByText('Participation', { exact: true }),
  ).toHaveCount(0);
  await expect(
    progressDialog.getByText('Approval', { exact: true }),
  ).toHaveCount(0);
  await expect(progressDialog.getByText('Disagreement limit')).toBeVisible();
  await expect(progressDialog.getByText('Abstention limit')).toBeVisible();
  await expect(
    progressDialog.getByText(
      'All conditions are met. Eligible to pass when voting closes.',
    ),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(progressDialog).toBeHidden();

  await expect(
    ratifiedProposal.getByText('Voting', { exact: true }),
  ).toBeVisible();

  expirePollDeadline(blockedPoll.id);
  expirePollDeadline(ratifiedPoll.id);

  await expect(
    blockedProposal.getByText('Closed', { exact: true }),
  ).toBeVisible();
  await blockedProposal.getByRole('button', { name: /^\d+ votes?$/ }).click();
  await expect(progressDialog.getByText(/Failed conditions/)).toContainText(
    'block present',
  );
  await page.keyboard.press('Escape');
  await expect(progressDialog).toBeHidden();

  await expect(
    ratifiedProposal.getByText('Ratified', { exact: true }),
  ).toBeVisible();

  const configResponse = await request.get(
    `/api/servers/${server.id}/configs`,
    { headers: authorizationHeaders(proposer) },
  );
  await expect(configResponse).toBeOK();
  const { serverConfig } = (await configResponse.json()) as {
    serverConfig: { anonymousUsersEnabled: boolean };
  };
  expect(serverConfig.anonymousUsersEnabled).toBe(true);
});

test('vote progress separates participant approval from member-based quorum', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'vote-progress-admin');
  const createdServer = await createServer(request, serverAdmin, {
    name: `Vote progress ${serverAdmin.user.suffix}`,
    slug: `vote-progress-${serverAdmin.user.suffix}`,
  });
  const progressInvite = await createInvite(
    request,
    serverAdmin,
    createdServer.id,
  );
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('vote-progress-proposer'),
    progressInvite,
  );
  const supporter = await signUpViaApi(
    request,
    createTestUser('vote-progress-supporter'),
    progressInvite,
  );
  await signUpViaApi(
    request,
    createTestUser('vote-progress-observer'),
    progressInvite,
  );
  const server = await getServerBySlug(request, proposer, createdServer.slug);

  // Approval uses Agree + Disagree votes; quorum uses all four members
  await updateServerConfig(request, serverAdmin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    quorumEnabled: true,
    quorumThreshold: 50,
    disagreementsLimit: 1,
    abstainsLimit: 1,
    votingTimeLimit: 30,
    anonymousUsersEnabled: false,
  });

  const chat = new ChatPage(page);
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await chat.expectChannel('general');

  const proposalBody = `Vote progress proposal ${proposer.user.suffix}`;
  const poll = await createTestProposal(
    page,
    server.generalChannelId,
    proposalBody,
  );
  const proposal = page.getByRole('article', {
    name: `Consensus Proposal: ${proposalBody}`,
  });
  await expect(proposal).toBeVisible();

  await proposal.getByRole('button', { name: /^\d+ votes?$/ }).click();
  const progressDialog = page.getByRole('dialog', { name: 'Vote Progress' });
  await expect(progressDialog).toBeVisible();

  await expect(
    progressDialog.getByText('Approval', { exact: true }),
  ).toBeVisible();
  await expect(
    progressDialog.getByText('No participants yet (51% required)'),
  ).toBeVisible();
  await expect(
    progressDialog.getByText('Participation', { exact: true }),
  ).toBeVisible();
  await expect(
    progressDialog.getByText('0 of 2 responses required'),
  ).toBeVisible();
  await expect(
    progressDialog.getByText('50% quorum across 4 eligible channel members'),
  ).toBeVisible();

  // Nothing has been voted on yet, so no rule can read as satisfied
  await expect(progressDialog.getByLabel('met', { exact: true })).toHaveCount(
    0,
  );
  await expect(progressDialog.getByLabel('pending')).toHaveCount(3);

  await page.keyboard.press('Escape');
  await expect(progressDialog).toBeHidden();

  await voteViaApi(
    request,
    supporter,
    server.id,
    server.generalChannelId,
    poll.id,
    'agree',
  );
  await expect(proposal.getByRole('button', { name: '1 vote' })).toBeVisible();

  await proposal.getByRole('button', { name: '1 vote' }).click();
  await expect(progressDialog).toBeVisible();
  await expect(
    progressDialog.getByText('1 of 1 participants agree so far (51% required)'),
  ).toBeVisible();
  await expect(
    progressDialog.getByText('1 of 2 responses required'),
  ).toBeVisible();
  await expect(progressDialog.getByLabel('pending')).toHaveCount(0);
  await expect(progressDialog.getByLabel('met', { exact: true })).toHaveCount(
    3,
  );
});

async function createTestProposal(page: Page, channelId: string, body: string) {
  await openCreateProposalDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a New Proposal' });
  await selectRadixOption(dialog, page, 'Select an action type', 'Test');
  await dialog.getByPlaceholder('Enter your proposal details...').fill(body);
  await dialog.getByRole('button', { name: 'Next' }).click();

  return submitProposal(page, dialog, channelId);
}

async function createSettingsProposal(
  page: Page,
  channelId: string,
  body: string,
) {
  await openCreateProposalDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a New Proposal' });
  await selectRadixOption(
    dialog,
    page,
    'Select an action type',
    'Change settings',
  );
  await dialog.getByPlaceholder('Enter your proposal details...').fill(body);
  await dialog.getByRole('button', { name: 'Next' }).click();

  await dialog.getByRole('switch', { name: 'Anonymous users' }).click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  return submitProposal(page, dialog, channelId);
}

async function submitProposal(page: Page, dialog: Locator, channelId: string) {
  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${channelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create proposal' }).click();
  const response = await createProposalResponse;
  await expect(dialog).toBeHidden();

  const { poll } = (await response.json()) as PollResponse;
  return poll;
}
