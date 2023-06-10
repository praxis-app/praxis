import { UNAUTHORIZED } from "../../common/common.constants";
import { ObjectValues } from "../../common/common.types";
import {
  GroupPermission,
  ServerPermission,
} from "../../roles/permissions/permissions.constants";
import { UserPermissions } from "../../users/user.types";

export const hasPermission = (
  permissions: UserPermissions | null,
  permission:
    | ObjectValues<typeof GroupPermission>
    | ObjectValues<typeof ServerPermission>,
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
