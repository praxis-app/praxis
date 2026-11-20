import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type Page,
} from '@playwright/test';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import {
  authorizationHeaders,
  getOrCreateInstanceAdmin,
  seedAuthenticatedSession,
  signUpViaApi,
  type AuthenticatedUser,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import { assertUuid, runDatabaseCommand } from '../lib/db';
import { createForumChannel } from '../lib/forums';
import { grantInstancePermissions } from '../lib/instance-roles';
import { createInvite } from '../lib/invites';
import { createMessages } from '../lib/messages';
import { type PermissionRule } from '../lib/permissions';
import { expirePollDeadline, voteViaApi } from '../lib/polls';
import { grantServerPermissions } from '../lib/server-roles';
import { createServer, joinServer, updateServerConfig } from '../lib/servers';
import { NavigationPage } from '../pages/navigation.page';
import { testTimeout } from '../lib/timeouts';

const TOMBSTONE = 'Removed by a moderator';
const TOAST_LIFETIME_MS = 5_000;

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

type ModerationServer = {
  id: string;
  name: string;
  slug: string;
  generalChannelId: string;
};

const createModerationServer = async (
  request: APIRequestContext,
  admin: AuthenticatedUser,
): Promise<ModerationServer> => {
  const suffix = randomUUID().slice(0, 8);
  const server = await createServer(request, admin, {
    name: `Moderation ${suffix}`,
    slug: `moderation-${suffix}`,
  });
  const channelsResponse = await request.get(
    `/api/servers/${server.id}/channels`,
    { headers: authorizationHeaders(admin) },
  );
  await expect(channelsResponse).toBeOK();
  const { channels } = (await channelsResponse.json()) as {
    channels: { id: string }[];
  };

  return {
    id: server.id,
    name: server.name,
    slug: server.slug,
    generalChannelId: channels[0].id,
  };
};

const addServerMember = async (
  request: APIRequestContext,
  admin: AuthenticatedUser,
  server: ModerationServer,
  label: string,
  permissions: PermissionRule[] = [],
) => {
  const member = await signUpViaApi(request, createTestUser(label));
  const inviteToken = await createInvite(request, admin, server.id);
  await joinServer(request, member, server.id, inviteToken);
  if (permissions.length) {
    await grantServerPermissions(
      request,
      admin,
      member,
      server.id,
      permissions,
      label,
    );
  }
  return member;
};

const openPageAs = async (
  browser: Browser,
  user: AuthenticatedUser,
  path: string,
) => {
  const context = await browser.newContext();
  await seedAuthenticatedSession(context, user.accessToken);
  const page = await context.newPage();
  await page.goto(path);
  return page;
};

const postMessage = async (
  request: APIRequestContext,
  author: AuthenticatedUser,
  server: ModerationServer,
  body: string,
  withImage = false,
) => {
  const path = `/api/servers/${server.id}/channels/${server.generalChannelId}/messages`;
  const response = await request.post(path, {
    headers: authorizationHeaders(author),
    ...(withImage
      ? {
          multipart: {
            payload: JSON.stringify({ body }),
            files: {
              name: 'pixel.png',
              mimeType: 'image/png',
              buffer: PIXEL_PNG,
            },
          },
        }
      : { data: { body } }),
  });
  await expect(response).toBeOK();
};

const confirmModeration = async (
  page: Page,
  dialogName: string,
  confirmLabel: string,
  endpoint: RegExp,
  reason?: string,
  method = 'POST',
) => {
  const dialog = page.getByRole('dialog', { name: dialogName });
  if (reason) {
    await dialog.getByRole('textbox').fill(reason);
  }
  const moderationResponse = page.waitForResponse(
    (response) =>
      response.request().method() === method && endpoint.test(response.url()),
  );
  await dialog.getByRole('button', { name: confirmLabel, exact: true }).click();
  expect((await moderationResponse).ok()).toBe(true);
  await expect(dialog).toHaveCount(0);
};

const moderateMemberFromSettings = async (
  page: Page,
  member: AuthenticatedUser,
  menuItem: string,
  dialogName: string,
  confirmLabel: string,
  endpoint: RegExp,
) => {
  await page
    .getByRole('button', { name: `Actions for ${member.user.name}` })
    .click();
  await page.getByRole('menuitem', { name: menuItem }).click();
  await confirmModeration(
    page,
    dialogName,
    confirmLabel,
    endpoint,
    'Repeated spam',
  );
};

const addAccountModerator = async (request: APIRequestContext) => {
  const moderator = await signUpViaApi(request, createTestUser('accounts'));
  await grantInstancePermissions(
    request,
    moderator,
    [{ subject: 'User', action: ['update', 'delete'] }],
    'accounts',
  );
  return moderator;
};

const suspendFromSettings = async (page: Page, target: AuthenticatedUser) => {
  await page
    .getByRole('button', { name: `Actions for ${target.user.name}` })
    .click();
  await page.getByRole('menuitem', { name: 'Suspend account' }).click();
  await confirmModeration(
    page,
    'Suspend this account?',
    'Suspend',
    /\/users\/[^/]+\/suspend$/,
    'Repeated harassment',
  );
};

const deleteFromSettings = async (page: Page, target: AuthenticatedUser) => {
  await page
    .getByRole('button', { name: `Actions for ${target.user.name}` })
    .click();
  await page.getByRole('menuitem', { name: 'Delete account' }).click();
  await confirmModeration(
    page,
    'Delete this account?',
    'Delete',
    /\/users\/[^/]+$/,
    'Repeated harassment',
    'DELETE',
  );
};

const ACCOUNT_NOTICE_TITLES = {
  suspended: 'Your account has been suspended',
  deleted: 'Your account has been deleted',
};

const moderationNotice = (page: Page, title: string) =>
  page.getByRole('dialog', { name: title });

const expectModerationNotice = async (
  page: Page,
  title: string,
  reason?: string,
) => {
  await page.bringToFront();
  const notice = moderationNotice(page, title);
  await expect(notice).toBeVisible();
  await expect(notice.getByRole('button', { name: 'OK' })).toBeVisible();
  if (reason) {
    await expect(notice).toContainText(reason);
  }
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
};

const dismissModerationNotice = async (page: Page, title: string) => {
  const notice = moderationNotice(page, title);
  await notice.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(notice).toHaveCount(0);
};

const expectNoticeStaysUntilDismissed = async (page: Page, title: string) => {
  await page.waitForTimeout(TOAST_LIFETIME_MS);
  await expect(moderationNotice(page, title)).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(moderationNotice(page, title)).toBeVisible();
  await dismissModerationNotice(page, title);
};

const expectSessionEnded = async (
  page: Page,
  status: keyof typeof ACCOUNT_NOTICE_TITLES,
  server: ModerationServer,
) => {
  await expectModerationNotice(
    page,
    ACCOUNT_NOTICE_TITLES[status],
    'Repeated harassment',
  );
  await new NavigationPage(page).expectAccessTokenCleared();
  await expect(page).not.toHaveURL(new RegExp(`/s/${server.slug}(/|$)`));
};

const expectSignedOut = async (page: Page) => {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
};

const serverAccessTitle = (
  action: 'removed' | 'banned',
  server: ModerationServer,
) => `You've been ${action} from ${server.name}`;

const expectServerAccessNotice = (
  page: Page,
  action: 'removed' | 'banned',
  server: ModerationServer,
) =>
  expectModerationNotice(
    page,
    serverAccessTitle(action, server),
    'Repeated spam',
  );

const expectServerAccessLost = async (
  page: Page,
  action: 'removed' | 'banned',
  server: ModerationServer,
) => {
  await expectServerAccessNotice(page, action, server);
  await expectNoticeStaysUntilDismissed(
    page,
    serverAccessTitle(action, server),
  );
  await expect(page).not.toHaveURL(new RegExp(`/s/${server.slug}(/|$)`));
};

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('moderator can remove messages and forum posts for everyone in realtime', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const author = await addServerMember(request, admin, server, 'author');
  const moderator = await addServerMember(request, admin, server, 'content', [
    { subject: 'Message', action: ['delete'] },
  ]);
  const suffix = randomUUID().slice(0, 8);
  const textBody = `E2E spam text ${suffix}`;
  const imageBody = `E2E spam image ${suffix}`;
  await postMessage(request, author, server, textBody);
  await postMessage(request, author, server, imageBody, true);

  const channelPath = `/s/${server.slug}/c/${server.generalChannelId}`;
  const observerPage = await openPageAs(browser, author, channelPath);
  const moderatorPage = await openPageAs(browser, moderator, channelPath);

  try {
    for (const body of [textBody, imageBody]) {
      const message = moderatorPage
        .getByTestId('feed')
        .locator('[data-message-id]')
        .filter({ hasText: body });
      await message.hover();
      await message.getByRole('button', { name: 'Open message menu' }).click();
      await moderatorPage
        .getByRole('menuitem', { name: 'Remove message' })
        .click();
      await confirmModeration(
        moderatorPage,
        'Remove this message?',
        'Remove',
        /\/messages\/[^/]+\/remove$/,
        'Spam links',
      );
      await expect(observerPage.getByText(body)).toHaveCount(0);
    }

    for (const page of [moderatorPage, observerPage]) {
      await expect(page.getByTestId('feed').getByText(TOMBSTONE)).toHaveCount(
        2,
      );
      await expect(
        page.getByTestId('feed').getByRole('img', { name: 'Attached image' }),
      ).toHaveCount(0);
    }

    await moderatorPage.reload();
    await expect(
      moderatorPage.getByTestId('feed').getByText(TOMBSTONE),
    ).toHaveCount(2);
    await expect(moderatorPage.getByText(textBody)).toHaveCount(0);

    const forum = await createForumChannel(
      request,
      admin,
      server.id,
      `mod-forum-${suffix}`,
    );
    const postsPath = `/api/servers/${server.id}/channels/${forum.id}/forum/posts`;
    const postResponse = await request.post(postsPath, {
      headers: authorizationHeaders(author),
      data: { title: `Spam post ${suffix}`, body: 'Buy now' },
    });
    await expect(postResponse).toBeOK();
    const { post } = (await postResponse.json()) as { post: { id: string } };
    const replyBody = `Please keep this reply ${suffix}`;
    const replyResponse = await request.post(
      `${postsPath}/${post.id}/replies`,
      { headers: authorizationHeaders(admin), data: { body: replyBody } },
    );
    await expect(replyResponse).toBeOK();

    const postPath = `/s/${server.slug}/c/${forum.id}/posts/${post.id}`;
    await moderatorPage.goto(postPath);
    await moderatorPage.getByRole('button', { name: 'Open post menu' }).click();
    await moderatorPage.getByRole('menuitem', { name: 'Remove post' }).click();
    await confirmModeration(
      moderatorPage,
      'Remove this post?',
      'Remove',
      /\/forum\/posts\/[^/]+\/remove$/,
      'Commercial spam',
    );

    await expect(
      moderatorPage.getByRole('heading', { name: TOMBSTONE }).first(),
    ).toBeVisible();
    await expect(moderatorPage.getByText('Buy now')).toHaveCount(0);
    await expect(moderatorPage.getByText(replyBody)).toBeVisible();
  } finally {
    await observerPage.context().close();
    await moderatorPage.context().close();
  }
});

test('proposal pause budget auto-restores and prevents re-hiding after 13 hours of previous pauses', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  await updateServerConfig(request, admin, server.id, {
    decisionMakingModel: 'consensus',
    votingTimeLimit: 60,
    quorumEnabled: false,
  });
  const moderator = await addServerMember(
    request,
    admin,
    server,
    'pause-manager',
    [{ subject: 'Proposal', action: ['manage'] }],
  );
  const path = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const body = `Bounded review ${randomUUID()}`;
  const created = await request.post(path, {
    headers: authorizationHeaders(admin),
    data: { body, pollType: 'proposal', action: { actionType: 'general' } },
  });
  await expect(created).toBeOK();
  const { poll } = await created.json();
  assertUuid(poll.id, 'Poll ID');
  const voteId = await voteViaApi(
    request,
    admin,
    server.id,
    server.generalChannelId,
    poll.id,
    'agree',
  );
  const hide = (actor = moderator) =>
    request.post(`${path}/${poll.id}/hide`, {
      headers: authorizationHeaders(actor),
      data: { reason: 'Review needed' },
    });
  const backdate = (hours: number) => {
    expect(
      runDatabaseCommand(
        `UPDATE polls SET hidden_at = now() - interval '${hours} hours' WHERE id = '${poll.id}';`,
      ),
    ).toContain('UPDATE 1');
  };
  await expect(await hide()).toBeOK();
  backdate(13);
  await expect(
    await request.post(`${path}/${poll.id}/restore`, {
      headers: authorizationHeaders(moderator),
    }),
  ).toBeOK();
  await expect(await hide()).toBeOK();
  const page = await openPageAs(
    browser,
    admin,
    `/s/${server.slug}/c/${server.generalChannelId}?poll=${poll.id}`,
  );
  try {
    const proposal = page.locator(`[data-decision-id="${poll.id}"]`).first();
    await expect(
      proposal.getByText('Hidden by a moderator. Voting is paused.'),
    ).toBeVisible();
    backdate(12);
    const readPoll = async () => {
      const response = await request.get(`${path}/${poll.id}/replies`, {
        headers: authorizationHeaders(admin),
      });
      await expect(response).toBeOK();
      return (await response.json()).root;
    };
    await expect.poll(async () => !!(await readPoll()).hiddenAt).toBe(false);
    const restored = await readPoll();
    expect(restored.stage).toBe('voting');
    expect(restored.votes.map((vote: { id: string }) => vote.id)).toContain(
      voteId,
    );
    const extension =
      (Date.parse(restored.config.closingAt) -
        Date.parse(poll.config.closingAt)) /
      1000;
    expect(extension).toBeGreaterThanOrEqual(86400);
    expect(extension).toBeLessThan(86405);
    await expect(
      proposal.getByText('Hidden by a moderator. Voting is paused.'),
    ).toHaveCount(0);
    await proposal.getByRole('button', { name: 'Open proposal menu' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Pause limit reached (24 hours)' }),
    ).toBeDisabled();
    await page.keyboard.press('Escape');
    for (const actor of [moderator, admin]) {
      expect((await hide(actor)).status()).toBe(409);
    }
    const audit = await request.get(
      `/api/servers/${server.id}/audit-log?action=restore_poll`,
      { headers: authorizationHeaders(admin) },
    );
    await expect(audit).toBeOK();
    expect((await audit.json()).entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'restore_poll', origin: 'system' }),
      ]),
    );
  } finally {
    await page.context().close();
  }
});

test('moderator can hide and restore a proposal for everyone in realtime', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const author = await addServerMember(request, admin, server, 'proposer');
  const moderator = await addServerMember(request, admin, server, 'hider', [
    { subject: 'Proposal', action: ['manage'] },
  ]);
  const body = `E2E off topic proposal ${randomUUID().slice(0, 8)}`;
  const pollResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(author),
      data: { body, pollType: 'proposal', action: { actionType: 'general' } },
    },
  );
  await expect(pollResponse).toBeOK();

  const channelPath = `/s/${server.slug}/c/${server.generalChannelId}`;
  const { poll } = await pollResponse.json();
  await createMessages({
    request,
    user: author,
    serverId: server.id,
    channelId: server.generalChannelId,
    bodies: Array.from({ length: 30 }, (_, i) => `Later message ${i}`),
  });
  const focusedPath = `${channelPath}?poll=${poll.id}`;
  const authorPage = await openPageAs(browser, author, focusedPath);
  const historyPage = await openPageAs(browser, author, channelPath);
  const historyFeed = historyPage.getByTestId('feed');
  const moderatorPage = await openPageAs(browser, moderator, focusedPath);
  const authorFeed = authorPage.getByTestId('feed');
  const hiddenNotice = 'This proposal was hidden by a moderator';
  const pausedLabel = 'Hidden by a moderator. Voting is paused.';

  try {
    await expect(authorFeed.getByText(body)).toBeVisible();
    await expect(historyFeed.getByText('Later message 29')).toBeVisible();
    await historyFeed.hover();
    await historyPage.mouse.wheel(0, -10_000);
    await expect(historyFeed.getByText(body)).toBeVisible();
    const proposal = moderatorPage
      .getByTestId('feed')
      .locator('[data-decision-id]')
      .filter({ hasText: body });
    await proposal.getByRole('button', { name: 'Open proposal menu' }).click();
    await moderatorPage
      .getByRole('menuitem', { name: 'Hide proposal' })
      .click();
    await confirmModeration(
      moderatorPage,
      'Hide this proposal?',
      'Hide',
      /\/polls\/[^/]+\/hide$/,
      'Off topic',
    );

    await expect(authorFeed.getByText(hiddenNotice)).toBeVisible();
    await expect(historyFeed.getByText(hiddenNotice)).toHaveCount(1);
    await expect(historyFeed.getByText(body)).toHaveCount(0);
    await expect(authorFeed.getByText(body)).toHaveCount(0);
    await expect(authorFeed.getByRole('button', { name: 'Agree' })).toHaveCount(
      0,
    );
    await expect(proposal.getByText(pausedLabel)).toBeVisible();
    await expect(proposal.getByText(body)).toBeVisible();

    await proposal.getByRole('button', { name: 'Open proposal menu' }).click();
    await moderatorPage
      .getByRole('menuitem', { name: 'Restore proposal' })
      .click();
    await confirmModeration(
      moderatorPage,
      'Restore this proposal?',
      'Restore',
      /\/polls\/[^/]+\/restore$/,
    );

    await expect(authorFeed.getByText(body)).toBeVisible();
    await expect(authorFeed.getByText(hiddenNotice)).toHaveCount(0);
    await expect(proposal.getByText(pausedLabel)).toHaveCount(0);
    await expect(historyFeed.getByText(body)).toHaveCount(1);
    await expect(historyFeed.getByText(hiddenNotice)).toHaveCount(0);
  } finally {
    await authorPage.context().close();
    await historyPage.context().close();
    await moderatorPage.context().close();
  }
});

test('moderator can remove and ban server members', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const manager = await addServerMember(request, admin, server, 'manager', [
    { subject: 'ServerMember', action: ['manage'] },
  ]);
  const removed = await addServerMember(request, admin, server, 'kicked');
  const banned = await addServerMember(request, admin, server, 'banned');

  const serverPath = `/s/${server.slug}/c/${server.generalChannelId}`;
  const removedPage = await openPageAs(browser, removed, serverPath);
  const bannedPage = await openPageAs(browser, banned, serverPath);
  const managerPage = await openPageAs(
    browser,
    manager,
    `/s/${server.slug}/settings/members`,
  );

  try {
    await expect(
      removedPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();
    await expect(
      bannedPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await moderateMemberFromSettings(
      managerPage,
      removed,
      'Remove member',
      'Remove server member?',
      'Remove',
      /\/members\/[^/]+\/remove$/,
    );
    await expectServerAccessLost(removedPage, 'removed', server);

    await moderateMemberFromSettings(
      managerPage,
      banned,
      'Ban member',
      'Ban server member?',
      'Ban',
      /\/members\/[^/]+\/ban$/,
    );
    await expectServerAccessLost(bannedPage, 'banned', server);

    await expect(managerPage.getByText('Banned users')).toBeVisible();
    await expect(
      managerPage.getByRole('button', { name: 'Unban' }),
    ).toHaveCount(1);

    const rejoinToken = await createInvite(request, admin, server.id);
    const rejoin = await request.post(`/api/servers/${server.id}/join`, {
      headers: authorizationHeaders(banned),
      data: { inviteToken: rejoinToken },
    });
    expect(rejoin.ok()).toBe(false);
  } finally {
    await removedPage.context().close();
    await bannedPage.context().close();
    await managerPage.context().close();
  }
});

test('adjusted electorate includes suspended voters only in proposals where their votes count', async ({
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const proposer = await addServerMember(
    request,
    admin,
    server,
    'quorum-proposer',
  );
  const voter = await addServerMember(request, admin, server, 'quorum-voter');
  const nonvoter = await addServerMember(
    request,
    admin,
    server,
    'quorum-nonvoter',
  );
  await updateServerConfig(request, admin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 100,
    quorumEnabled: true,
    quorumThreshold: 100,
    votingTimeLimit: 30,
    disagreementsLimit: 0,
    abstainsLimit: 0,
  });
  const pollsPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const created = await request.post(pollsPath, {
    headers: authorizationHeaders(proposer),
    data: {
      body: `Suspension quorum ${randomUUID()}`,
      pollType: 'proposal',
      action: { actionType: 'general' },
    },
  });
  await expect(created).toBeOK();
  const { poll } = await created.json();
  const otherCreated = await request.post(pollsPath, {
    headers: authorizationHeaders(proposer),
    data: {
      body: `Active voter quorum ${randomUUID()}`,
      pollType: 'proposal',
      action: { actionType: 'general' },
    },
  });
  await expect(otherCreated).toBeOK();
  const { poll: otherPoll } = await otherCreated.json();
  for (const user of [proposer, admin]) {
    await voteViaApi(
      request,
      user,
      server.id,
      server.generalChannelId,
      otherPoll.id,
      'agree',
    );
  }
  const voteIds: string[] = [];
  for (const user of [proposer, voter]) {
    voteIds.push(
      await voteViaApi(
        request,
        user,
        server.id,
        server.generalChannelId,
        poll.id,
        'agree',
      ),
    );
  }
  const readPoll = async (pollId = poll.id) => {
    const response = await request.get(`${pollsPath}/${pollId}/replies`, {
      headers: authorizationHeaders(proposer),
    });
    await expect(response).toBeOK();
    return (await response.json()).root;
  };
  const before = await readPoll();
  expect(before.memberCount).toBe(4);
  expect(before.votes).toHaveLength(2);
  expect(before.stage).toBe('voting');

  for (const target of [voter, nonvoter]) {
    const suspended = await request.post(
      `/api/users/${target.userId}/suspend`,
      {
        headers: authorizationHeaders(admin),
        data: { reason: 'Repeated harassment' },
      },
    );
    await expect(suspended).toBeOK();
  }
  const after = await readPoll();
  expect.soft(after.memberCount).toBe(3);
  expect(after.votes).toHaveLength(2);
  expect(after.votes.map((vote: { id: string }) => vote.id)).toEqual(
    expect.arrayContaining(voteIds),
  );

  const otherAfter = await readPoll(otherPoll.id);
  expect(otherAfter.memberCount).toBe(2);
  expect(otherAfter.votes).toHaveLength(2);

  expirePollDeadline(poll.id);
  expirePollDeadline(otherPoll.id);
  await expect.poll(async () => (await readPoll()).stage).toBe('closed');
  await expect
    .poll(async () => (await readPoll(otherPoll.id)).stage)
    .toBe('ratified');
});

test('suspended and deleted users are signed out right away and told why', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const moderator = await addAccountModerator(request);
  const suspended = await addServerMember(request, admin, server, 'suspended');
  const deleted = await addServerMember(request, admin, server, 'deleted');

  const channelPath = `/s/${server.slug}/c/${server.generalChannelId}`;
  const suspendedPage = await openPageAs(browser, suspended, channelPath);
  const deletedPage = await openPageAs(browser, deleted, channelPath);
  const moderatorPage = await openPageAs(browser, moderator, '/settings/users');

  try {
    for (const page of [suspendedPage, deletedPage]) {
      await expect(page.getByPlaceholder('Send a message...')).toBeVisible();
    }

    await suspendFromSettings(moderatorPage, suspended);
    await expectSessionEnded(suspendedPage, 'suspended', server);

    await deleteFromSettings(moderatorPage, deleted);
    await expectSessionEnded(deletedPage, 'deleted', server);
    await expect(
      moderationNotice(deletedPage, ACCOUNT_NOTICE_TITLES.suspended),
    ).toHaveCount(0);

    await expectNoticeStaysUntilDismissed(
      suspendedPage,
      ACCOUNT_NOTICE_TITLES.suspended,
    );
    await expectNoticeStaysUntilDismissed(
      deletedPage,
      ACCOUNT_NOTICE_TITLES.deleted,
    );
    for (const page of [suspendedPage, deletedPage]) {
      await expectSignedOut(page);
    }
  } finally {
    await suspendedPage.context().close();
    await deletedPage.context().close();
    await moderatorPage.context().close();
  }
});

test('members without moderation permissions cannot moderate members, content or accounts', async ({
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const actor = await addServerMember(request, admin, server, 'bystander');
  const target = await addServerMember(request, admin, server, 'target');
  const suffix = randomUUID().slice(0, 8);
  const channelPath = `/api/servers/${server.id}/channels`;

  const messageResponse = await request.post(
    `${channelPath}/${server.generalChannelId}/messages`,
    {
      headers: authorizationHeaders(target),
      data: { body: `Protected message ${suffix}` },
    },
  );
  await expect(messageResponse).toBeOK();
  const { message } = (await messageResponse.json()) as {
    message: { id: string };
  };
  const forum = await createForumChannel(
    request,
    admin,
    server.id,
    `authz-forum-${suffix}`,
  );
  const postResponse = await request.post(
    `${channelPath}/${forum.id}/forum/posts`,
    {
      headers: authorizationHeaders(target),
      data: { title: `Protected post ${suffix}`, body: 'Keep this' },
    },
  );
  await expect(postResponse).toBeOK();
  const { post } = (await postResponse.json()) as { post: { id: string } };

  const memberPath = `/api/servers/${server.id}/members/${target.userId}`;
  const accountPath = `/api/users/${target.userId}`;
  const attempts: [string, 'post' | 'delete', string][] = [
    ['remove member', 'post', `${memberPath}/remove`],
    ['ban member', 'post', `${memberPath}/ban`],
    ['unban member', 'delete', `${memberPath}/ban`],
    [
      'remove message',
      'post',
      `${channelPath}/${server.generalChannelId}/messages/${message.id}/remove`,
    ],
    [
      'remove forum post',
      'post',
      `${channelPath}/${forum.id}/forum/posts/${post.id}/remove`,
    ],
    ['suspend account', 'post', `${accountPath}/suspend`],
    ['restore account', 'post', `${accountPath}/restore`],
    ['delete account', 'delete', accountPath],
  ];
  for (const [label, method, path] of attempts) {
    const response = await request[method](path, {
      headers: authorizationHeaders(actor),
      data: { reason: 'Not my call to make' },
    });
    expect.soft(response.status(), label).toBe(403);
  }

  const targetHeaders = { headers: authorizationHeaders(target) };
  await expect(await request.get('/api/users/me', targetHeaders)).toBeOK();
  const feedResponse = await request.get(
    `${channelPath}/${server.generalChannelId}/feed`,
    targetHeaders,
  );
  await expect(feedResponse).toBeOK();
  expect(await feedResponse.text()).toContain(`Protected message ${suffix}`);
});

test('account moderators cannot moderate themselves, other moderators or administrators', async ({
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const actor = await addAccountModerator(request);
  const peer = await addAccountModerator(request);
  const attempt = (
    target: AuthenticatedUser,
    action: 'suspend' | 'restore' | 'delete',
  ) => {
    const options = {
      headers: authorizationHeaders(actor),
      data: { reason: 'Hierarchy check' },
    };
    return action === 'delete'
      ? request.delete(`/api/users/${target.userId}`, options)
      : request.post(`/api/users/${target.userId}/${action}`, options);
  };

  for (const action of ['suspend', 'restore', 'delete'] as const) {
    expect
      .soft((await attempt(actor, action)).status(), `self ${action}`)
      .toBe(400);
    expect
      .soft((await attempt(peer, action)).status(), `peer ${action}`)
      .toBe(403);
    expect
      .soft((await attempt(admin, action)).status(), `admin ${action}`)
      .toBe(403);
  }

  for (const user of [actor, peer, admin]) {
    await expect(
      await request.get('/api/users/me', {
        headers: authorizationHeaders(user),
      }),
    ).toBeOK();
  }
});

test('votes cannot be cast, changed or withdrawn while a proposal is hidden', async ({
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  await updateServerConfig(request, admin, server.id, {
    decisionMakingModel: 'consensus',
    votingTimeLimit: 60,
    quorumEnabled: false,
  });
  const voter = await addServerMember(request, admin, server, 'voter');
  const latecomer = await addServerMember(request, admin, server, 'latecomer');
  const pollsPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const created = await request.post(pollsPath, {
    headers: authorizationHeaders(admin),
    data: {
      body: `Paused voting ${randomUUID().slice(0, 8)}`,
      pollType: 'proposal',
      action: { actionType: 'general' },
    },
  });
  await expect(created).toBeOK();
  const { poll } = (await created.json()) as { poll: { id: string } };
  const voteId = await voteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    poll.id,
    'agree',
  );
  await expect(
    await request.post(`${pollsPath}/${poll.id}/hide`, {
      headers: authorizationHeaders(admin),
      data: { reason: 'Review needed' },
    }),
  ).toBeOK();

  const votesPath = `${pollsPath}/${poll.id}/votes`;
  const cast = await request.post(votesPath, {
    headers: authorizationHeaders(latecomer),
    data: { voteType: 'agree' },
  });
  expect.soft(cast.status(), 'cast').toBe(409);
  const changed = await request.put(`${votesPath}/${voteId}`, {
    headers: authorizationHeaders(voter),
    data: { voteType: 'disagree' },
  });
  expect.soft(changed.status(), 'change').toBe(409);
  const withdrawn = await request.delete(`${votesPath}/${voteId}`, {
    headers: authorizationHeaders(voter),
  });
  expect.soft(withdrawn.status(), 'withdraw').toBe(409);

  await expect(
    await request.post(`${pollsPath}/${poll.id}/restore`, {
      headers: authorizationHeaders(admin),
    }),
  ).toBeOK();
  await voteViaApi(
    request,
    latecomer,
    server.id,
    server.generalChannelId,
    poll.id,
    'agree',
  );
});
