import { allow } from 'graphql-shield';
import { canManageServerSettings } from '../rules/server-config.rules';

export const serverConfigPermissions = {
  Query: {
    serverConfig: allow,
  },
  Mutation: {
    updateServerConfig: canManageServerSettings,
    updateDefaultGroups: canManageServerSettings,
  },
  ObjectTypes: {
    ServerConfig: {
      id: allow,
      websiteURL: allow,
      contactEmail: allow,
    },
  },
};
