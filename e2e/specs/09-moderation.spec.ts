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
import { type PermissionRule } from '../lib/permissions';
import { grantServerPermissions } from '../lib/server-roles';
import { createServer, joinServer } from '../lib/servers';
import { NavigationPage } from '../pages/navigation.page';

const TOMBSTONE = 'Removed by a moderator';

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
) => {
  const dialog = page.getByRole('dialog', { name: dialogName });
  if (reason) {
    await dialog.getByRole('textbox').fill(reason);
  }
  const moderationResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && endpoint.test(response.url()),
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

const expectServerAccessLost = async (
  page: Page,
  action: 'removed' | 'banned',
  serverName: string,
) => {
  await expect(
    page
      .getByText(
        new RegExp(`(You were|You've been) ${action} from ${serverName}`),
      )
      .first(),
  ).toBeVisible();
};

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('content moderators replace chat and forum items with live tombstones', async ({
  browser,
  request,
}) => {
  test.setTimeout(60_000);

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

test('member managers remove and ban members who then lose the server', async ({
  browser,
  request,
}) => {
  test.setTimeout(60_000);

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
    await moderateMemberFromSettings(
      managerPage,
      banned,
      'Ban member',
      'Ban server member?',
      'Ban',
      /\/members\/[^/]+\/ban$/,
    );

    await expectServerAccessLost(removedPage, 'removed', server.name);
    await expectServerAccessLost(bannedPage, 'banned', server.name);
    await expect(bannedPage.getByText('Repeated spam').first()).toBeVisible();

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

test('account moderators suspend a signed-in user out of the app', async ({
  browser,
  request,
}) => {
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

    await expect(
      targetPage.getByText('This account has been suspended.'),
    ).toBeVisible();
    await new NavigationPage(targetPage).expectAccessTokenCleared();
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

test('call managers end a call while another user is connected', async ({
  browser,
  request,
}) => {
  test.setTimeout(90_000);

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
      .getByRole('menuitem', { name: 'End call for everyone' })
      .click();
    await confirmModeration(
      managerPage,
      'End this call?',
      'End call for everyone',
      /\/calls\/[^/]+\/end$/,
      'Disruptive call',
    );

    await expect(
      participantPage.getByText('A moderator ended the call.'),
    ).toBeVisible();
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
