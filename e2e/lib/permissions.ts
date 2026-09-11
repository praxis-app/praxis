import { randomUUID } from 'node:crypto';
import { expect, type APIRequestContext } from '@playwright/test';
import { authorizationHeaders, type AuthenticatedUser } from './auth';

export type PermissionRule = {
  subject: string;
  action: string[];
};

export const SERVER_PERMISSIONS = {
  createInvites: { subject: 'Invite', action: ['create'] },
  manageConfig: { subject: 'ServerConfig', action: ['manage'] },
} as const satisfies Record<string, PermissionRule>;

export const INSTANCE_PERMISSIONS = {
  manageServers: { subject: 'Server', action: ['manage'] },
} as const satisfies Record<string, PermissionRule>;

const GRANT_ROLE_COLOR = '#2196f3';

export async function grantViaNewRole(
  request: APIRequestContext,
  granter: AuthenticatedUser,
  rolesPath: string,
  roleKey: 'serverRole' | 'instanceRole',
  user: AuthenticatedUser,
  permissions: PermissionRule[],
  label: string,
) {
  const roleName = `e2e-${label.slice(0, 17)}-${randomUUID().slice(0, 8)}`;
  const createResponse = await request.post(rolesPath, {
    headers: authorizationHeaders(granter),
    data: {
      name: roleName,
      color: GRANT_ROLE_COLOR,
    },
  });
  await expect(createResponse).toBeOK();
  const created = (await createResponse.json()) as Record<
    string,
    { id: string }
  >;
  const roleId = created[roleKey].id;

  const permissionsResponse = await request.put(
    `${rolesPath}/${roleId}/permissions`,
    {
      headers: authorizationHeaders(granter),
      data: { permissions },
    },
  );
  await expect(permissionsResponse).toBeOK();

  const membersResponse = await request.post(`${rolesPath}/${roleId}/members`, {
    headers: authorizationHeaders(granter),
    data: { userIds: [user.userId] },
  });
  await expect(membersResponse).toBeOK();

  return roleId;
}
