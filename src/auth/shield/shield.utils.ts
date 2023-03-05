import { ServerPermissions } from "../../roles/permissions/permissions.constants";
import { UNAUTHORIZED } from "../../common/common.constants";
import { UserPermissions } from "../../users/users.service";

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
