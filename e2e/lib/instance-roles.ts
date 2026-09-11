import { type APIRequestContext } from '@playwright/test';
import { getOrCreateInstanceAdmin, type AuthenticatedUser } from './auth';
import { grantViaNewRole, type PermissionRule } from './permissions';

const INSTANCE_ROLES_PATH = '/api/instance/roles';

export async function grantInstancePermissions(
  request: APIRequestContext,
  user: AuthenticatedUser,
  permissions: PermissionRule[],
  label: string,
) {
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  if (instanceAdmin.userId === user.userId) {
    return;
  }

  await grantViaNewRole(
    request,
    instanceAdmin,
    INSTANCE_ROLES_PATH,
    'instanceRole',
    user,
    permissions,
    label,
  );
}
