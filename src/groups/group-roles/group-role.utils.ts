import { GroupPermissions } from './models/group-permissions.type';

export const initGroupRolePermissions = (
  enabled = false,
): GroupPermissions => ({
  approveMemberRequests: enabled,
  createEvents: enabled,
  deleteGroup: enabled,
  manageComments: enabled,
  manageEvents: enabled,
  managePosts: enabled,
  manageRoles: enabled,
  manageSettings: enabled,
  removeMembers: enabled,
  updateGroup: enabled,
});
