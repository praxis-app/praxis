import { canManageServerSettings } from '../rules/server-config.rules';

export const serverConfigPermissions = {
  Query: {
    serverConfig: canManageServerSettings,
  },
  Mutation: {
    updateServerConfig: canManageServerSettings,
  },
};
