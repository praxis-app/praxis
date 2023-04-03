import { GroupPermissions, ServerPermissions } from "./permissions.constants";

export const initPermissions = (
  permission: typeof ServerPermissions | typeof GroupPermissions,
  enabled = false
) =>
  Object.values(permission).map((name) => ({
    enabled,
    name,
  }));
