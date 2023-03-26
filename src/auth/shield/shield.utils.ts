import { UNAUTHORIZED } from "../../common/common.constants";
import { ServerPermissions } from "../../roles/permissions/permissions.constants";
import { UserPermissions } from "../../users/user.types";

export const hasPermission = (
  permissions: UserPermissions | null,
  permission: ServerPermissions
) => {
  if (!permissions) {
    return UNAUTHORIZED;
  }
  const hasPermission = permissions.serverPermissions.has(permission);
  if (!hasPermission) {
    return false;
  }
  return true;
};
