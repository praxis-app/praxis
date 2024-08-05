import { ServerPermissions } from './models/server-permissions.type';

export const initServerRolePermissions = (
  enabled = false,
): ServerPermissions => ({
  createInvites: enabled,
  manageComments: enabled,
  manageEvents: enabled,
  manageInvites: enabled,
  managePosts: enabled,
  manageQuestionnaireTickets: enabled,
  manageQuestions: enabled,
  manageRoles: enabled,
  manageRules: enabled,
  manageSettings: enabled,
  removeGroups: enabled,
  removeMembers: enabled,
  removeProposals: enabled,
});

export const cleanPermissions = <T>(permissions?: Partial<T>): Partial<T> => {
  if (!permissions) {
    return {};
  }
  return Object.entries(permissions)
    .filter(([_, value]) => typeof value === 'boolean')
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});
};
