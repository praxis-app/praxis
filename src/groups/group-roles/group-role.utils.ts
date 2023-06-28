import { GroupPermissions } from "./models/group-role-permission.model";

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

/** Removes any null or undefined fields from `object` */
export const cleanPermissions = <T>(object: T): Partial<T> =>
  Object.entries(object)
    .filter(([_, value]) => typeof value === "boolean")
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});
