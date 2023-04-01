import { GroupPermissions, ServerPermissions } from "./permissions.constants";

export const initServerPermissions = (enabled = false) =>
  Object.values(ServerPermissions).map((name) => ({
    enabled,
    name,
  }));

export const initGroupPermissions = (enabled = false) =>
  Object.values(GroupPermissions).map((name) => ({
    enabled,
    name,
  }));
