import { ServerPermissions } from './models/server-permissions.type';

export const initServerRolePermissions = (
  enabled = false,
): ServerPermissions => ({
  manageComments: enabled,
  manageEvents: enabled,
  managePosts: enabled,
  manageRoles: enabled,
  removeMembers: enabled,
  manageInvites: enabled,
  createInvites: enabled,
});
