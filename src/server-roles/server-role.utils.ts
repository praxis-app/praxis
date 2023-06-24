import { ServerPermissions } from "./models/server-role-permission.model";

export const initServerRolePermissions = (
  enabled = false
): ServerPermissions => ({
  manageComments: enabled,
  manageEvents: enabled,
  managePosts: enabled,
  manageRoles: enabled,
  removeMembers: enabled,
  manageInvites: enabled,
  createInvites: enabled,
});
