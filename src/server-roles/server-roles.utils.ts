import { ServerPermissions } from './models/server-permissions.type';

export const initServerRolePermissions = (
  enabled = false,
): ServerPermissions => ({
  createInvites: enabled,
  manageComments: enabled,
  manageEvents: enabled,
  manageInvites: enabled,
  managePosts: enabled,
  manageRoles: enabled,
  manageSettings: enabled,
  removeGroups: enabled,
  removeMembers: enabled,
  removeProposals: enabled,
});
