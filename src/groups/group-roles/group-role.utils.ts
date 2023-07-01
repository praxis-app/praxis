import { GroupPermissions } from "./models/group-permissions.type";

export const initGroupRolePermissions = (
  enabled = false
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

export const cleanPermissions = <T>(object: T): Partial<T> => {
  if (!object) {
    return {};
  }
  return Object.entries(object)
    .filter(([_, value]) => typeof value === "boolean")
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});
};
