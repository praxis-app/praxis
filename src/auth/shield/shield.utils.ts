import { UNAUTHORIZED } from "../../common/common.constants";
import { UserPermissions } from "../../users/user.types";

// TODO: Update to work with new permissions setup
export const hasPermission = (
  permissions: UserPermissions | null,
  permission: any,
  groupId?: number
) => {
  if (!permissions) {
    return UNAUTHORIZED;
  }

  if (groupId) {
    const groupPermissions = permissions.groupPermissions[groupId];
    if (!groupPermissions || !groupPermissions.has(permission)) {
      return false;
    }
    return true;
  }

  const hasPermission = permissions.serverPermissions.has(permission);
  if (!hasPermission) {
    return false;
  }
  return true;
};
