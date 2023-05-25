import { GroupPermission, ServerPermission } from "./permissions.constants";

export const initPermissions = (
  permission: typeof ServerPermission | typeof GroupPermission,
  enabled = false
) =>
  Object.values(permission).map((name: string) => ({
    enabled,
    name,
  }));
