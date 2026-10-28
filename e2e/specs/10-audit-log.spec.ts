import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
} from '@playwright/test';
import {
  authorizationHeaders,
  getOrCreateInstanceAdmin,
  seedAuthenticatedSession,
  signUpViaApi,
  type AuthenticatedUser,
} from '../lib/auth';
import { joinCallFromArtifact, startCallFromTopNav } from '../lib/calls';
import { createTestUser } from '../lib/data';
import { grantInstancePermissions } from '../lib/instance-roles';
import { createForumChannel, createForumPostWithProposal } from '../lib/forums';
import { createInvite } from '../lib/invites';
import { INSTANCE_PERMISSIONS, SERVER_PERMISSIONS } from '../lib/permissions';
import { makeProposalsRatifyWithOneAgreeVote, voteViaApi } from '../lib/polls';
import { grantServerPermissions } from '../lib/server-roles';
import { createServer, joinServer } from '../lib/servers';

const openPageAs = async (
  browser: Browser,
  user: AuthenticatedUser,
  path: string,
) => {
  const context = await browser.newContext();
  await seedAuthenticatedSession(context, user.accessToken);
  const page = await context.newPage();
  await page.goto(path);
  return { context, page };
};

const join = async (
  request: APIRequestContext,
  admin: AuthenticatedUser,
  user: AuthenticatedUser,
  serverId: string,
) => {
  const invite = await createInvite(request, admin, serverId);
  await joinServer(request, user, serverId, invite);
};

test('server and instance viewers see only their authorized audit scope and can filter it', async ({
  browser,
  request,
}) => {
  const admin = await getOrCreateInstanceAdmin(request);
  const suffix = admin.user.suffix;
  const serverA = await createServer(request, admin, {
    name: `Audit Alpha ${suffix}`,
    slug: `audit-alpha-${suffix}`,
  });
  const serverB = await createServer(request, admin, {
    name: `Audit Beta ${suffix}`,
    slug: `audit-beta-${suffix}`,
  });
  const channelsResponse = await request.get(
    `/api/servers/${serverA.id}/channels`,
    { headers: authorizationHeaders(admin) },
  );
  await expect(channelsResponse).toBeOK();
  const channelId = (await channelsResponse.json()).channels[0].id as string;
  const serverViewer = await signUpViaApi(
    request,
    createTestUser('audit-server-viewer'),
  );
  const instanceViewer = await signUpViaApi(
    request,
    createTestUser('audit-instance-viewer'),
  );
  const moderatedMember = await signUpViaApi(
    request,
    createTestUser('audit-moderated-member'),
  );
  await join(request, admin, serverViewer, serverA.id);
  await join(request, admin, moderatedMember, serverA.id);
  await grantServerPermissions(
    request,
    admin,
    serverViewer,
    serverA.id,
    [SERVER_PERMISSIONS.viewAuditLog],
    'audit-server-viewer',
  );
  await grantInstancePermissions(
    request,
    instanceViewer,
    [INSTANCE_PERMISSIONS.viewAuditLog],
    'audit-instance-viewer',
  );

  const banResponse = await request.post(
    `/api/servers/${serverA.id}/members/${moderatedMember.userId}/ban`,
    {
      headers: authorizationHeaders(admin),
      data: { reason: 'Repeated audit test abuse' },
    },
  );
  await expect(banResponse).toBeOK();

  await makeProposalsRatifyWithOneAgreeVote(request, admin, serverA.id);
  const proposalResponse = await request.post(
    `/api/servers/${serverA.id}/channels/${channelId}/polls`,
    {
      headers: authorizationHeaders(admin),
      data: {
        body: 'Enable anonymous access for audit coverage',
        pollType: 'proposal',
        action: {
          actionType: 'change-settings',
          serverConfig: { anonymousUsersEnabled: true },
        },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = (await proposalResponse.json()).poll;
  await voteViaApi(request, admin, serverA.id, channelId, proposal.id, 'agree');

  const forum = await createForumChannel(
    request,
    admin,
    serverA.id,
    `audit-forum-${suffix}`,
  );
  const forumPost = await createForumPostWithProposal(
    request,
    admin,
    serverA.id,
    forum.id,
    `Audit forum proposal ${suffix}`,
    'Disable anonymous access for audit coverage',
    {
      actionType: 'change-settings',
      serverConfig: { anonymousUsersEnabled: false },
    },
  );
  await voteViaApi(
    request,
    admin,
    serverA.id,
    forum.id,
    forumPost.proposal.id,
    'agree',
  );

  const serverSession = await openPageAs(
    browser,
    serverViewer,
    `/s/${serverA.slug}/settings/audit-log`,
  );
  const serverEntries = serverSession.page.locator('[data-slot="card"]');
  await expect(serverEntries.getByText('Banned member')).toBeVisible();
  await expect(serverEntries.getByText(serverB.name)).toHaveCount(0);

  const proposalLinks = serverEntries.getByRole('link', {
    name: 'Approved proposal',
  });
  await expect(proposalLinks).toHaveCount(2);
  const proposalHrefs = await proposalLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  expect(proposalHrefs).toEqual(
    expect.arrayContaining([
      `/s/${serverA.slug}/c/${channelId}?poll=${proposal.id}`,
      `/s/${serverA.slug}/c/${forum.id}/posts/${forumPost.id}`,
    ]),
  );

  const instanceSession = await openPageAs(
    browser,
    instanceViewer,
    '/settings/audit-log',
  );
  const instanceEntries = instanceSession.page.locator('[data-slot="card"]');
  await expect(instanceEntries.getByText(serverA.name).first()).toBeVisible();
  await expect(instanceEntries.getByText(serverB.name).first()).toBeVisible();
  await instanceSession.page.getByRole('combobox', { name: /^Server/ }).click();
  await instanceSession.page
    .getByRole('option', { name: serverB.name, exact: true })
    .click();
  await expect(instanceEntries.getByText(serverB.name).first()).toBeVisible();
  await expect(instanceEntries.getByText(serverA.name)).toHaveCount(0);

  await serverSession.context.close();
  await instanceSession.context.close();
});

test('every audit log entry type renders readable details', async ({
  browser,
  request,
}) => {
  test.setTimeout(120_000);

  const admin = await getOrCreateInstanceAdmin(request);
  const headers = authorizationHeaders(admin);
  const suffix = admin.user.suffix;
  const send = async (
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data?: unknown,
  ) => {
    const response = await request[method](`/api${path}`, { headers, data });
    await expect(
      response,
      `${method} ${path}: ${await response.text()}`,
    ).toBeOK();
    return response.json().catch(() => ({}));
  };

  const server = await createServer(request, admin, {
    name: `Audit Display ${suffix}`,
    slug: `audit-display-${suffix}`,
  });
  const serverPath = `/servers/${server.id}`;
  const channelsResponse = await request.get(`/api${serverPath}/channels`, {
    headers,
  });
  await expect(channelsResponse).toBeOK();
  const channelId = (await channelsResponse.json()).channels[0].id as string;
  const channelPath = `${serverPath}/channels/${channelId}`;
  const member = await signUpViaApi(
    request,
    createTestUser('audit-display-member'),
  );
  const bystander = await signUpViaApi(
    request,
    createTestUser('audit-display-bystander'),
  );
  await join(request, admin, member, server.id);
  await join(request, admin, bystander, server.id);

  await send('put', serverPath, {
    name: `Audit Renamed ${suffix}`.slice(0, 30),
    slug: `audit-display-${suffix}`,
    description: 'Renamed for audit coverage',
  });
  await send('put', `${serverPath}/configs`, {
    agreementThreshold: 60,
    decisionMakingModel: 'majority-vote',
  });

  const { serverRole } = await send('post', `${serverPath}/roles`, {
    name: 'display-role',
    color: '#f44336',
  });
  const rolePath = `${serverPath}/roles/${serverRole.id}`;
  await send('put', rolePath, { name: 'display-renamed', color: '#2196f3' });
  await send('put', `${rolePath}/permissions`, {
    permissions: [SERVER_PERMISSIONS.viewAuditLog],
  });
  await send('post', `${rolePath}/members`, { userIds: [member.userId] });
  await send('delete', `${rolePath}/members/${member.userId}`);
  await send('delete', rolePath);

  const { invite } = await send('post', `${serverPath}/invites`, {
    maxUses: 5,
    expiresAt: null,
  });
  await send('delete', `${serverPath}/invites/${invite.id}`);

  await makeProposalsRatifyWithOneAgreeVote(request, admin, server.id);
  const { poll: roleProposal } = await send('post', `${channelPath}/polls`, {
    body: 'Create a role for audit display coverage',
    pollType: 'proposal',
    action: {
      actionType: 'create-role',
      serverRole: {
        name: 'proposed-role',
        color: '#4caf50',
        members: [{ userId: member.userId, changeType: 'add' }],
        permissions: [
          {
            subject: 'AuditLog',
            actions: [{ action: 'read', changeType: 'add' }],
          },
        ],
      },
    },
  });
  await voteViaApi(
    request,
    admin,
    server.id,
    channelId,
    roleProposal.id,
    'agree',
  );

  const { message } = await send('post', `${channelPath}/messages`, {
    body: 'Spam for audit display coverage',
  });
  await send('post', `${channelPath}/messages/${message.id}/remove`, {
    reason: 'Spam',
  });
  const forum = await createForumChannel(
    request,
    admin,
    server.id,
    `display-forum`,
  );
  const { post } = await send(
    'post',
    `${serverPath}/channels/${forum.id}/forum/posts`,
    { title: 'Spam post', body: 'Buy now' },
  );
  await send(
    'post',
    `${serverPath}/channels/${forum.id}/forum/posts/${post.id}/remove`,
    { reason: 'Spam' },
  );

  const callerSession = await openPageAs(
    browser,
    member,
    `/s/${server.slug}/c/${channelId}`,
  );
  const startCallResponse = callerSession.page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      /\/calls$/.test(response.url()) &&
      response.status() === 200,
  );
  await startCallFromTopNav(callerSession.page);
  const callId = (await (await startCallResponse).json()).call.id as string;
  const listenerSession = await openPageAs(
    browser,
    bystander,
    `/s/${server.slug}/c/${channelId}`,
  );
  await joinCallFromArtifact(
    listenerSession.page,
    listenerSession.page
      .locator('article')
      .filter({ hasText: `Started by ${member.user.name}` }),
  );
  await expect(
    listenerSession.page.getByTestId('call-participant-tile'),
  ).toHaveCount(2);
  await expect(async () => {
    await send(
      'post',
      `${channelPath}/calls/${callId}/participants/${member.userId}/remove`,
      { reason: 'Disruptive' },
    );
    const { entries } = await send(
      'get',
      `${serverPath}/audit-log?action=remove_call_participant`,
    );
    expect(entries).toHaveLength(1);
  }).toPass({ timeout: 15_000 });
  await send('post', `${channelPath}/calls/${callId}/end`, {
    reason: 'Disruptive',
  });
  await callerSession.context.close();
  await listenerSession.context.close();

  const memberPath = `${serverPath}/members/${member.userId}`;
  await send('post', `${memberPath}/ban`, { reason: 'Harassment' });
  await send('delete', `${memberPath}/ban`, { reason: 'Appealed' });
  await join(request, admin, member, server.id);
  await send('post', `${memberPath}/remove`, { reason: 'Inactive' });

  const { instanceRole } = await send('post', '/instance/roles', {
    name: 'display-instance',
    color: '#9c27b0',
  });
  const instanceRolePath = `/instance/roles/${instanceRole.id}`;
  await send('put', instanceRolePath, {
    name: 'display-instance-renamed',
    color: '#673ab7',
  });
  await send('put', `${instanceRolePath}/permissions`, {
    permissions: [INSTANCE_PERMISSIONS.viewAuditLog],
  });
  await send('post', `${instanceRolePath}/members`, {
    userIds: [bystander.userId],
  });
  await send('delete', `${instanceRolePath}/members/${bystander.userId}`);
  await send('delete', instanceRolePath);

  await send('post', `/users/${bystander.userId}/suspend`, {
    reason: 'Spam account',
  });
  await send('post', `/users/${bystander.userId}/restore`, {
    reason: 'Appealed',
  });
  await send('delete', `/users/${member.userId}`, { reason: 'Spam account' });
  const doomed = await createServer(request, admin, {
    name: `Audit Doomed ${suffix}`,
    slug: `audit-doomed-${suffix}`,
  });
  await send('delete', `/servers/${doomed.id}`);

  const { context, page } = await openPageAs(
    browser,
    admin,
    '/settings/audit-log',
  );
  const loadMore = page.getByRole('button', { name: 'Load more' });
  await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
  while (await loadMore.isVisible()) {
    await loadMore.click();
    await expect(page.getByText('Loading...')).toHaveCount(0);
  }

  const entries = page.locator('[data-slot="card"]');
  const expectedActions = [
    'Created server',
    'Updated server',
    'Deleted server',
    'Updated server settings',
    'Created invite link',
    'Deleted invite link',
    'Created role',
    'Updated role',
    'Updated role permissions',
    'Added role members',
    'Removed role member',
    'Deleted role',
    'Removed message',
    'Removed forum post',
    'Removed call participant',
    'Ended call',
    'Banned member',
    'Unbanned member',
    'Removed member',
    'Suspended user',
    'Restored user',
    'Deleted user',
  ];
  for (const action of expectedActions) {
    await expect(
      entries.getByText(action, { exact: true }).first(),
    ).toBeVisible();
  }

  const rawJson = /[[{]\s*"|"\s*:/;
  const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  for (const text of await entries.allInnerTexts()) {
    expect(text).not.toMatch(rawJson);
    expect(text).not.toMatch(uuid);
  }

  await expect(entries.getByText('60%').first()).toBeVisible();
  await expect(entries.getByText('Up to 5 uses').first()).toBeVisible();
  await expect(entries.getByText('Never expires').first()).toBeVisible();
  await expect(entries.getByText('Majority vote').first()).toBeVisible();
  await expect(entries.getByText('#2196f3').first()).toBeVisible();
  await expect(entries.getByText('View Audit Log').first()).toBeVisible();
  await expect(entries.getByText(member.user.name).first()).toBeVisible();
  await expect(entries.getByText(bystander.user.name).first()).toBeVisible();

  await context.close();
});
