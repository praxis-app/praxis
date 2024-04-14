import { isAuthenticated } from '../rules/auth.rules';
import { canManageServerRoles } from '../rules/role.rules';

export const serverRolePermissions = {
  Mutation: {
    createServerRole: canManageServerRoles,
    updateServerRole: canManageServerRoles,
    deleteServerRole: canManageServerRoles,
    deleteServerRoleMember: canManageServerRoles,
  },
  ObjectTypes: {
    ServerPermissions: isAuthenticated,
  },
};
