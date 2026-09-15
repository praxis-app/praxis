import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { randomUUID } from 'node:crypto';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  seedAuthenticatedSession,
  signUpViaApi,
  type AuthenticatedUser,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import { createInvite } from '../lib/invites';
import { grantServerPermissions } from '../lib/server-roles';
import {
  createServer,
  createServerAdmin,
  getDefaultServer,
  getServerBySlug,
  joinServer,
} from '../lib/servers';

test('removed server members lose the permissions their roles granted', async ({
  context,
  page,
  request,
}) => {
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const member = await signUpViaApi(request, createTestUser('removed-member'));
  const server = await getDefaultServer(request, instanceAdmin);
  await grantServerPermissions(
    request,
    instanceAdmin,
    member,
    server.id,
    [{ subject: 'Channel', action: ['manage'] }],
    'removed-member',
  );

  const createChannel = (name: string) =>
    request.post(`/api/servers/${server.id}/channels`, {
      headers: authorizationHeaders(member),
      data: { name, channelType: 'text' },
    });
  await expect(
    await createChannel(`before-removal-${member.user.suffix}`),
  ).toBeOK();

  await seedAuthenticatedSession(context, instanceAdmin.accessToken);
  await page.goto(`/settings/servers/${server.id}/edit?tab=members`);
  await page
    .getByText(member.user.name, { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "justify-between")][1]')
    .getByRole('button')
    .click();
  const dialog = page.getByRole('dialog', { name: 'Remove server member?' });
  const removeMemberResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'DELETE' &&
      response.url().endsWith(`/api/servers/${server.id}/members`),
  );
  await dialog.getByRole('button', { name: 'Remove' }).click();
  expect((await removeMemberResponse).ok()).toBe(true);
  await expect(page.getByText(member.user.name, { exact: true })).toHaveCount(
    0,
  );

  const afterRemoval = await createChannel(
    `after-removal-${member.user.suffix}`,
  );
  expect(afterRemoval.status()).toBe(403);
});

test('granting and revoking a server role changes what a member can do', async ({
  context,
  page,
  request,
}) => {
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const member = await signUpViaApi(request, createTestUser('role-member'));
  const server = await getDefaultServer(request, instanceAdmin);
  const roleName = `e2e-channels-${randomUUID().slice(0, 8)}`;

  await seedAuthenticatedSession(context, instanceAdmin.accessToken);
  await page.goto(`/s/${server.slug}/settings/roles`);
  const createRoleResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/api/servers/${server.id}/roles`),
  );
  await page.locator('input[name="name"]').fill(roleName);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  expect((await createRoleResponse).ok()).toBe(true);

  await page.getByRole('link', { name: new RegExp(roleName) }).click();
  await page.getByRole('tab', { name: 'Permissions' }).click();
  await page.getByRole('switch', { name: 'Manage channels' }).click();
  const savePermissionsResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().endsWith('/permissions'),
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await savePermissionsResponse).ok()).toBe(true);

  await page.getByRole('tab', { name: 'Members' }).click();
  await page.getByText('Add members', { exact: true }).click();
  const addMembersDialog = page.getByRole('dialog', { name: 'Add members' });
  await addMembersDialog.getByText(member.user.name, { exact: true }).click();
  const addMembersResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/members'),
  );
  await addMembersDialog
    .getByRole('button', { name: 'Add', exact: true })
    .click();
  expect((await addMembersResponse).ok()).toBe(true);
  const roleSettingsUrl = page.url();

  await seedAuthenticatedSession(context, member.accessToken);
  await expectCreateChannelMenuItem(page, server, 1);
  await expect(
    await createChannelViaApi(request, member, server.id, 'granted'),
  ).toBeOK();

  await seedAuthenticatedSession(context, instanceAdmin.accessToken);
  await page.goto(roleSettingsUrl);
  await page
    .getByText(member.user.name, { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "justify-between")][1]')
    .getByRole('button')
    .click();
  const removeRoleMemberDialog = page.getByRole('dialog', {
    name: 'Remove role member?',
  });
  const removeRoleMemberResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'DELETE' &&
      response.url().endsWith(`/members/${member.userId}`),
  );
  await removeRoleMemberDialog.getByRole('button', { name: 'Remove' }).click();
  expect((await removeRoleMemberResponse).ok()).toBe(true);

  await seedAuthenticatedSession(context, member.accessToken);
  await expectCreateChannelMenuItem(page, server, 0);
  const afterRevoke = await createChannelViaApi(
    request,
    member,
    server.id,
    'revoked',
  );
  expect(afterRevoke.status()).toBe(403);
});

test('a server role grants nothing in another server', async ({
  context,
  page,
  request,
}) => {
  const serverAdmin = await createServerAdmin(request, 'cross-server-admin');
  const suffix = serverAdmin.user.suffix;
  const createdServerA = await createServer(request, serverAdmin, {
    name: `Role scope A ${suffix}`,
    slug: `role-scope-a-${suffix}`,
  });
  const createdServerB = await createServer(request, serverAdmin, {
    name: `Role scope B ${suffix}`,
    slug: `role-scope-b-${suffix}`,
  });
  const inviteA = await createInvite(request, serverAdmin, createdServerA.id);
  const inviteB = await createInvite(request, serverAdmin, createdServerB.id);
  const member = await createAuthenticatedUser(
    request,
    context,
    createTestUser('cross-server-member'),
    inviteA,
  );
  await joinServer(request, member, createdServerB.id, inviteB);
  await grantServerPermissions(
    request,
    serverAdmin,
    member,
    createdServerA.id,
    [{ subject: 'all', action: ['manage'] }],
    'cross-server',
  );
  const serverA = await getServerBySlug(request, member, createdServerA.slug);
  const serverB = await getServerBySlug(request, member, createdServerB.slug);

  await expect(
    await createChannelViaApi(request, member, serverA.id, 'server-a'),
  ).toBeOK();
  const serverBChannel = await createChannelViaApi(
    request,
    member,
    serverB.id,
    'server-b',
  );
  expect(serverBChannel.status()).toBe(403);
  const serverBInvites = await request.get(
    `/api/servers/${serverB.id}/invites`,
    { headers: authorizationHeaders(member) },
  );
  expect(serverBInvites.status()).toBe(403);

  await expectCreateChannelMenuItem(page, serverA, 1);
  await expectCreateChannelMenuItem(page, serverB, 0);

  await page.goto(`/s/${serverA.slug}/settings/roles`);
  await expect(page.locator('input[name="name"]')).toBeVisible();
  await page.goto(`/s/${serverB.slug}/settings/roles`);
  await expect(page.getByText('Access denied.')).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveCount(0);
});

type ServerSummary = {
  id: string;
  slug: string;
  generalChannelId: string;
};

async function expectCreateChannelMenuItem(
  page: Page,
  server: ServerSummary,
  count: 0 | 1,
) {
  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('channel-list')).toBeVisible();
  await page
    .getByRole('button', { name: /praxis/ })
    .first()
    .click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole('menuitem', { name: 'Create channel' }),
  ).toHaveCount(count);
  await page.keyboard.press('Escape');
}

function createChannelViaApi(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  label: string,
) {
  return request.post(`/api/servers/${serverId}/channels`, {
    headers: authorizationHeaders(user),
    data: {
      name: `${label}-${randomUUID().slice(0, 8)}`,
      channelType: 'text',
    },
  });
}
