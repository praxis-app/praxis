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
import { joinCallFromArtifact, startCallFromTopNav } from '../lib/calls';
import { createTestUser } from '../lib/data';
import { createForumChannel } from '../lib/forums';
import { grantInstancePermissions } from '../lib/instance-roles';
import { createInvite } from '../lib/invites';
import { createMessages } from '../lib/messages';
import { type PermissionRule } from '../lib/permissions';
import {
  backdateHiddenPoll,
  getSecondsUntilPollCloses,
  voteViaApi,
} from '../lib/polls';
import { grantServerPermissions } from '../lib/server-roles';
import {
  createServer,
  enableAnonymousUsers,
  joinServer,
  updateServerConfig,
} from '../lib/servers';
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

const addMemberManager = (
  request: APIRequestContext,
  admin: AuthenticatedUser,
  server: ModerationServer,
) =>
  addServerMember(request, admin, server, 'manager', [
    { subject: 'ServerMember', action: ['manage'] },
  ]);

const joinModerationServer = async (
  request: APIRequestContext,
  admin: AuthenticatedUser,
  server: ModerationServer,
  member: AuthenticatedUser,
) => {
  const inviteToken = await createInvite(request, admin, server.id);
  await joinServer(request, member, server.id, inviteToken);
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
const CALL_NOTICE_TITLES = {
  removed: "You've been removed from the call",
  ended: 'The call has ended',
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

const dismissServerAccessNotice = (
  page: Page,
  action: 'removed' | 'banned',
  server: ModerationServer,
) => dismissModerationNotice(page, serverAccessTitle(action, server));

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

test('moderator can hide and restore a proposal for everyone in realtime', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const author = await addServerMember(request, admin, server, 'proposer');
  const moderator = await addServerMember(request, admin, server, 'hider', [
    { subject: 'Message', action: ['delete'] },
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

test('restoring a proposal hidden past its deadline gives back the hidden time', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  await updateServerConfig(request, admin, server.id, {
    decisionMakingModel: 'consensus',
    agreementThreshold: 51,
    disagreementsLimit: 2,
    abstainsLimit: 2,
    quorumEnabled: false,
    votingTimeLimit: 60,
  });
  const author = await addServerMember(request, admin, server, 'proposer');
  const moderator = await addServerMember(request, admin, server, 'hider', [
    { subject: 'Message', action: ['delete'] },
  ]);
  const pollsPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const created = await request.post(pollsPath, {
    headers: authorizationHeaders(author),
    data: {
      body: `E2E paused proposal ${randomUUID().slice(0, 8)}`,
      pollType: 'proposal',
      action: { actionType: 'general' },
    },
  });
  await expect(created).toBeOK();
  const { poll } = await created.json();
  await expect(
    await request.post(`${pollsPath}/${poll.id}/hide`, {
      headers: authorizationHeaders(moderator),
      data: { reason: 'Off topic' },
    }),
  ).toBeOK();
  backdateHiddenPoll(poll.id, 2, 1);

  const page = await openPageAs(
    browser,
    moderator,
    `/s/${server.slug}/c/${server.generalChannelId}?poll=${poll.id}`,
  );
  try {
    const proposal = page
      .getByTestId('feed')
      .locator(`[data-decision-id="${poll.id}"]`);
    await proposal.getByRole('button', { name: 'Open proposal menu' }).click();
    await page.getByRole('menuitem', { name: 'Restore proposal' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Restore this proposal?' }),
    ).toContainText('Its deadline moves back by the time it was hidden');
    await confirmModeration(
      page,
      'Restore this proposal?',
      'Restore',
      /\/polls\/[^/]+\/restore$/,
    );

    const secondsLeft = getSecondsUntilPollCloses(poll.id);
    expect(secondsLeft).toBeGreaterThan(55 * 60);
    expect(secondsLeft).toBeLessThan(65 * 60);
    await voteViaApi(
      request,
      author,
      server.id,
      server.generalChannelId,
      poll.id,
      'agree',
    );
  } finally {
    await page.context().close();
  }
});

test('moderators cannot hide a proposal that changes their own role', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const moderator = await addServerMember(request, admin, server, 'self-mod');
  const roleId = await grantServerPermissions(
    request,
    admin,
    moderator,
    server.id,
    [{ subject: 'Message', action: ['delete'] }],
    'self-mod',
  );
  const pollsPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const created = await request.post(pollsPath, {
    headers: authorizationHeaders(admin),
    data: {
      body: `E2E remove moderator ${randomUUID().slice(0, 8)}`,
      pollType: 'proposal',
      action: {
        actionType: 'change-role',
        serverRole: {
          serverRoleToUpdateId: roleId,
          members: [{ userId: moderator.userId, changeType: 'remove' }],
        },
      },
    },
  });
  await expect(created).toBeOK();
  const { poll } = await created.json();

  const page = await openPageAs(
    browser,
    moderator,
    `/s/${server.slug}/c/${server.generalChannelId}?poll=${poll.id}`,
  );
  try {
    const proposal = page
      .getByTestId('feed')
      .locator(`[data-decision-id="${poll.id}"]`);
    await proposal.getByRole('button', { name: 'Open proposal menu' }).click();
    await page.getByRole('menuitem', { name: 'Hide proposal' }).click();
    const dialog = page.getByRole('dialog', { name: 'Hide this proposal?' });
    await dialog.getByRole('textbox').fill('Not appropriate');
    const hideResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/polls\/[^/]+\/hide$/.test(response.url()),
    );
    await dialog.getByRole('button', { name: 'Hide', exact: true }).click();
    expect((await hideResponse).status()).toBe(403);
    await expect(
      page.getByText('You cannot hide a proposal that changes your own role.'),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(
      proposal.getByText('Hidden by a moderator. Voting is paused.'),
    ).toHaveCount(0);

    await expect(
      await request.post(`${pollsPath}/${poll.id}/hide`, {
        headers: authorizationHeaders(admin),
        data: { reason: 'Instance admin review' },
      }),
    ).toBeOK();
  } finally {
    await page.context().close();
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

test('moderator can suspend a signed in user', async ({ browser, request }) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const accountModerator = await signUpViaApi(
    request,
    createTestUser('accounts'),
  );
  await grantInstancePermissions(
    request,
    accountModerator,
    [{ subject: 'User', action: ['update'] }],
    'accounts',
  );
  const target = await addServerMember(request, admin, server, 'suspended');

  const targetPage = await openPageAs(
    browser,
    target,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const moderatorPage = await openPageAs(
    browser,
    accountModerator,
    '/settings/users',
  );

  try {
    await expect(
      targetPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await moderatorPage
      .getByRole('button', { name: `Actions for ${target.user.name}` })
      .click();
    await moderatorPage
      .getByRole('menuitem', { name: 'Suspend account' })
      .click();
    await confirmModeration(
      moderatorPage,
      'Suspend this account?',
      'Suspend',
      /\/users\/[^/]+\/suspend$/,
      'Repeated harassment',
    );

    await expectSessionEnded(targetPage, 'suspended', server);
    await expect(
      moderatorPage
        .getByText(target.user.name, { exact: true })
        .locator('xpath=ancestor::div[contains(@class, "justify-between")][1]')
        .getByText('Suspended'),
    ).toBeVisible();

    const login = await request.post('/api/auth/login', {
      data: { email: target.user.email, password: target.user.password },
    });
    expect(login.status()).toBe(401);
  } finally {
    await targetPage.context().close();
    await moderatorPage.context().close();
  }
});

test('moderator can remove a call participant and end the call for everyone', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(90_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const participant = await addServerMember(request, admin, server, 'caller');
  const callManager = await addServerMember(request, admin, server, 'calls', [
    { subject: 'Call', action: ['manage'] },
  ]);
  const channelPath = `/s/${server.slug}/c/${server.generalChannelId}`;
  const participantPage = await openPageAs(browser, participant, channelPath);
  const managerPage = await openPageAs(browser, callManager, channelPath);

  try {
    const startCallResponse = participantPage.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );
    await startCallFromTopNav(participantPage);
    await startCallResponse;
    await expect(
      participantPage.getByRole('button', { name: 'Leave call' }),
    ).toBeVisible();

    const callArtifact = managerPage
      .locator('article')
      .filter({ hasText: `Started by ${participant.user.name}` });
    await expect(callArtifact).toContainText('Call is active');
    await joinCallFromArtifact(managerPage, callArtifact);
    await expect(managerPage.getByTestId('call-participant-tile')).toHaveCount(
      2,
    );

    await managerPage.getByRole('button', { name: 'Moderate call' }).click();
    await managerPage
      .getByRole('menuitem', {
        name: `Remove ${participant.user.name} from call`,
      })
      .click();
    await confirmModeration(
      managerPage,
      'Remove from call?',
      'Remove',
      /\/participants\/[^/]+\/remove$/,
      'Disruptive participant',
    );

    await expectModerationNotice(
      participantPage,
      CALL_NOTICE_TITLES.removed,
      'Disruptive participant',
    );
    await expectNoticeStaysUntilDismissed(
      participantPage,
      CALL_NOTICE_TITLES.removed,
    );
    await expect(
      participantPage.getByRole('button', { name: 'Leave call' }),
    ).toHaveCount(0);
    await expect(managerPage.getByTestId('call-participant-tile')).toHaveCount(
      1,
    );

    await joinCallFromArtifact(
      participantPage,
      participantPage
        .locator('article')
        .filter({ hasText: `Started by ${participant.user.name}` }),
    );
    await expect(managerPage.getByTestId('call-participant-tile')).toHaveCount(
      2,
    );

    await managerPage.getByRole('button', { name: 'Moderate call' }).click();
    await managerPage
      .getByRole('menuitem', { name: 'End call for everyone' })
      .click();
    await confirmModeration(
      managerPage,
      'End this call?',
      'End call for everyone',
      /\/calls\/[^/]+\/end$/,
      'Disruptive call',
    );

    await expectModerationNotice(
      participantPage,
      CALL_NOTICE_TITLES.ended,
      'Disruptive call',
    );
    await dismissModerationNotice(participantPage, CALL_NOTICE_TITLES.ended);
    await expect(
      managerPage.getByRole('button', { name: 'Leave call' }),
    ).toHaveCount(0);
    await expect(managerPage.getByRole('dialog')).toHaveCount(0);
    await expect(
      participantPage.getByRole('button', { name: 'Leave call' }),
    ).toHaveCount(0);
    const participantArtifact = participantPage
      .locator('article')
      .filter({ hasText: `Started by ${participant.user.name}` });
    await expect(participantArtifact).toContainText('Call ended');
    await expect(
      participantArtifact.getByRole('button', { name: 'Join active video' }),
    ).toHaveCount(0);
  } finally {
    await participantPage.context().close();
    await managerPage.context().close();
  }
});

test('members are told right away when moderated in a server they are not viewing', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(60_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const viewedServer = await createModerationServer(request, admin);
  const removedFrom = await createModerationServer(request, admin);
  const bannedFrom = await createModerationServer(request, admin);
  const member = await addServerMember(
    request,
    admin,
    viewedServer,
    'elsewhere',
  );
  await joinModerationServer(request, admin, removedFrom, member);
  await joinModerationServer(request, admin, bannedFrom, member);
  const removingManager = await addMemberManager(request, admin, removedFrom);
  const banningManager = await addMemberManager(request, admin, bannedFrom);

  const viewedPath = `/s/${viewedServer.slug}/c/${viewedServer.generalChannelId}`;
  const memberPage = await openPageAs(browser, member, viewedPath);
  const removingPage = await openPageAs(
    browser,
    removingManager,
    `/s/${removedFrom.slug}/settings/members`,
  );
  const banningPage = await openPageAs(
    browser,
    banningManager,
    `/s/${bannedFrom.slug}/settings/members`,
  );

  try {
    await expect(
      memberPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await moderateMemberFromSettings(
      removingPage,
      member,
      'Remove member',
      'Remove server member?',
      'Remove',
      /\/members\/[^/]+\/remove$/,
    );
    await expectServerAccessNotice(memberPage, 'removed', removedFrom);

    await moderateMemberFromSettings(
      banningPage,
      member,
      'Ban member',
      'Ban server member?',
      'Ban',
      /\/members\/[^/]+\/ban$/,
    );
    await dismissServerAccessNotice(memberPage, 'removed', removedFrom);
    await expectServerAccessNotice(memberPage, 'banned', bannedFrom);
    await dismissServerAccessNotice(memberPage, 'banned', bannedFrom);

    await expect(memberPage).toHaveURL(new RegExp(viewedPath));
    await expect(
      memberPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();
  } finally {
    await memberPage.context().close();
    await removingPage.context().close();
    await banningPage.context().close();
  }
});

test('members are told right away when moderated from a page outside the server', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const manager = await addMemberManager(request, admin, server);
  const member = await addServerMember(request, admin, server, 'outside');

  const memberPage = await openPageAs(
    browser,
    member,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const managerPage = await openPageAs(
    browser,
    manager,
    `/s/${server.slug}/settings/members`,
  );

  try {
    await expect(
      memberPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();
    await memberPage.goto('/users/settings');
    await expect(memberPage.getByRole('textbox').first()).toBeVisible();

    await moderateMemberFromSettings(
      managerPage,
      member,
      'Ban member',
      'Ban server member?',
      'Ban',
      /\/members\/[^/]+\/ban$/,
    );

    await expectServerAccessNotice(memberPage, 'banned', server);
    await dismissServerAccessNotice(memberPage, 'banned', server);
    await expect(memberPage).toHaveURL(/\/users\/settings$/);

    await memberPage.goto(`/s/${server.slug}`);
    await expectServerAccessLost(memberPage, 'banned', server);
  } finally {
    await memberPage.context().close();
    await managerPage.context().close();
  }
});

test('anonymous members lose server access right away when moderated', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const manager = await addMemberManager(request, admin, server);
  await enableAnonymousUsers(request, admin, server.id);
  const inviteToken = await createInvite(request, admin, server.id);
  const anonResponse = await request.post('/api/auth/anon', {
    data: { inviteToken },
  });
  await expect(anonResponse).toBeOK();
  const { access_token: accessToken } = (await anonResponse.json()) as {
    access_token: string;
  };
  const meResponse = await request.get('/api/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await expect(meResponse).toBeOK();
  const {
    user: { id: userId, name },
  } = (await meResponse.json()) as { user: { id: string; name: string } };
  const anonymous = {
    accessToken,
    userId,
    user: { ...createTestUser('anonymous'), name },
  };

  const anonymousPage = await openPageAs(
    browser,
    anonymous,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const managerPage = await openPageAs(
    browser,
    manager,
    `/s/${server.slug}/settings/members`,
  );

  try {
    await expect(
      anonymousPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await moderateMemberFromSettings(
      managerPage,
      anonymous,
      'Remove member',
      'Remove server member?',
      'Remove',
      /\/members\/[^/]+\/remove$/,
    );

    await expectServerAccessNotice(anonymousPage, 'removed', server);
    await dismissServerAccessNotice(anonymousPage, 'removed', server);
    await expect(
      anonymousPage.getByRole('heading', {
        name: `You've been removed from ${server.name}`,
      }),
    ).toBeVisible();
    await expect(
      anonymousPage.getByPlaceholder('Send a message...'),
    ).toHaveCount(0);
  } finally {
    await anonymousPage.context().close();
    await managerPage.context().close();
  }
});

test('suspended users are signed out right away while viewing a channel', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const moderator = await addAccountModerator(request);
  const target = await addServerMember(request, admin, server, 'suspended');

  const targetPage = await openPageAs(
    browser,
    target,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const moderatorPage = await openPageAs(browser, moderator, '/settings/users');

  try {
    await expect(
      targetPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await suspendFromSettings(moderatorPage, target);

    await expectSessionEnded(targetPage, 'suspended', server);
    await expectNoticeStaysUntilDismissed(
      targetPage,
      ACCOUNT_NOTICE_TITLES.suspended,
    );
    await expectSignedOut(targetPage);
  } finally {
    await targetPage.context().close();
    await moderatorPage.context().close();
  }
});

test('deleted users are told their account was deleted right away', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const moderator = await addAccountModerator(request);
  const target = await addServerMember(request, admin, server, 'deleted');

  const targetPage = await openPageAs(
    browser,
    target,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const moderatorPage = await openPageAs(browser, moderator, '/settings/users');

  try {
    await expect(
      targetPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await deleteFromSettings(moderatorPage, target);

    await expectSessionEnded(targetPage, 'deleted', server);
    await expect(
      moderationNotice(targetPage, ACCOUNT_NOTICE_TITLES.suspended),
    ).toHaveCount(0);
    await expectNoticeStaysUntilDismissed(
      targetPage,
      ACCOUNT_NOTICE_TITLES.deleted,
    );
    await expectSignedOut(targetPage);
  } finally {
    await targetPage.context().close();
    await moderatorPage.context().close();
  }
});

test('suspended users are signed out right away on a page with no server subscription', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const manager = await addMemberManager(request, admin, server);
  const moderator = await addAccountModerator(request);
  const target = await addServerMember(request, admin, server, 'serverless');

  const serversResponse = await request.get('/api/users/me/servers', {
    headers: authorizationHeaders(target),
  });
  await expect(serversResponse).toBeOK();
  const { servers } = (await serversResponse.json()) as {
    servers: { id: string }[];
  };
  for (const { id } of servers.filter(({ id }) => id !== server.id)) {
    const removal = await request.post(
      `/api/servers/${id}/members/${target.userId}/remove`,
      {
        headers: authorizationHeaders(admin),
        data: { reason: 'Clearing memberships' },
      },
    );
    await expect(removal).toBeOK();
  }

  const targetPage = await openPageAs(
    browser,
    target,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const managerPage = await openPageAs(
    browser,
    manager,
    `/s/${server.slug}/settings/members`,
  );
  const moderatorPage = await openPageAs(browser, moderator, '/settings/users');

  try {
    await expect(
      targetPage.getByPlaceholder('Send a message...'),
    ).toBeVisible();

    await moderateMemberFromSettings(
      managerPage,
      target,
      'Remove member',
      'Remove server member?',
      'Remove',
      /\/members\/[^/]+\/remove$/,
    );
    await expectServerAccessNotice(targetPage, 'removed', server);

    await suspendFromSettings(moderatorPage, target);

    await expectSessionEnded(targetPage, 'suspended', server);
    await expect(
      moderationNotice(targetPage, serverAccessTitle('removed', server)),
    ).toHaveCount(0);
    await dismissModerationNotice(targetPage, ACCOUNT_NOTICE_TITLES.suspended);
    await expectSignedOut(targetPage);
  } finally {
    await targetPage.context().close();
    await managerPage.context().close();
    await moderatorPage.context().close();
  }
});

test('suspended users are removed from an active call right away', async ({
  browser,
  request,
}) => {
  test.setTimeout(testTimeout(90_000));

  const admin = await getOrCreateInstanceAdmin(request);
  const server = await createModerationServer(request, admin);
  const moderator = await addAccountModerator(request);
  const target = await addServerMember(request, admin, server, 'in-call');

  const targetPage = await openPageAs(
    browser,
    target,
    `/s/${server.slug}/c/${server.generalChannelId}`,
  );
  const moderatorPage = await openPageAs(browser, moderator, '/settings/users');

  try {
    const startCallResponse = targetPage.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/calls$/.test(response.url()) &&
        response.status() === 200,
    );
    await startCallFromTopNav(targetPage);
    await startCallResponse;
    await expect(
      targetPage.getByRole('button', { name: 'Leave call' }),
    ).toBeVisible();

    await suspendFromSettings(moderatorPage, target);

    await expectSessionEnded(targetPage, 'suspended', server);
    await expect(
      moderationNotice(targetPage, CALL_NOTICE_TITLES.removed),
    ).toHaveCount(0);
    await dismissModerationNotice(targetPage, ACCOUNT_NOTICE_TITLES.suspended);
    await expectSignedOut(targetPage);
    await expect(
      targetPage.getByRole('button', { name: 'Leave call' }),
    ).toHaveCount(0);
  } finally {
    await targetPage.context().close();
    await moderatorPage.context().close();
  }
});
