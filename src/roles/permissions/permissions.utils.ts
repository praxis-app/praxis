import { ServerPermissions } from "./permissions.constants";

export const initServerPermissions = (enabled = false) =>
  Object.values(ServerPermissions).map((name) => ({
    enabled,
    name,
  }));
