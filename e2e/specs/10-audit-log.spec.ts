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
import { createTestUser } from '../lib/data';
import { grantInstancePermissions } from '../lib/instance-roles';
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

  const serverSession = await openPageAs(
    browser,
    serverViewer,
    `/s/${serverA.slug}/settings/audit-log`,
  );
  const serverEntries = serverSession.page.locator('[data-slot="card"]');
  await expect(serverEntries.getByText('Banned member')).toBeVisible();
  await expect(serverEntries.getByText('Approved proposal')).toBeVisible();
  await expect(serverEntries.getByText(serverB.name)).toHaveCount(0);

  const instanceSession = await openPageAs(
    browser,
    instanceViewer,
    '/settings/audit-log',
  );
  const instanceEntries = instanceSession.page.locator('[data-slot="card"]');
  await expect(instanceEntries.getByText(serverA.name).first()).toBeVisible();
  await expect(instanceEntries.getByText(serverB.name).first()).toBeVisible();
  await instanceSession.page.getByLabel('Server').selectOption(serverB.id);
  await expect(instanceEntries.getByText(serverB.name).first()).toBeVisible();
  await expect(instanceEntries.getByText(serverA.name)).toHaveCount(0);

  await serverSession.context.close();
  await instanceSession.context.close();
});
