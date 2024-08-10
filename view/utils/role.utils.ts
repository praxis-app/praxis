import { t } from 'i18next';
import { Namespace, TFunction } from 'react-i18next';
import {
  GroupPermissions,
  GroupRolePermissionInput,
  ServerPermissions,
  ServerRolePermissionInput,
} from '../graphql/gen';

export type PermissionName = keyof Omit<
  ServerRolePermissionInput & GroupRolePermissionInput,
  '__typename'
>;

interface PermissionText {
  displayName: string;
  description: string;
}

export const getPermissionText = (
  name: PermissionName,
  isGroup = false,
): PermissionText => {
  const _t: TFunction<Namespace<'ns1'>, undefined> = t;
  switch (name) {
    case 'approveMemberRequests':
      return {
        displayName: _t('permissions.names.approveMemberRequests'),
        description: _t('permissions.descriptions.approveMemberRequests'),
      };
    case 'updateGroup':
      return {
        displayName: _t('permissions.names.updateGroup'),
        description: _t('permissions.descriptions.updateGroup'),
      };
    case 'deleteGroup':
      return {
        displayName: _t('permissions.names.deleteGroup'),
        description: _t('permissions.descriptions.deleteGroup'),
      };
    case 'manageSettings':
      return {
        displayName: _t('permissions.names.manageSettings'),
        description: isGroup
          ? _t('permissions.descriptions.manageGroupSettings')
          : _t('permissions.descriptions.manageServerSettings'),
      };
    case 'createEvents':
      return {
        displayName: _t('permissions.names.createEvents'),
        description: _t('permissions.descriptions.createEvents'),
      };
    case 'createInvites':
      return {
        displayName: _t('permissions.names.createInvites'),
        description: _t('permissions.descriptions.createInvites'),
      };
    case 'manageComments':
      return {
        displayName: _t('permissions.names.manageComments'),
        description: _t('permissions.descriptions.manageComments'),
      };
    case 'manageEvents':
      return {
        displayName: _t('permissions.names.manageEvents'),
        description: _t('permissions.descriptions.manageEvents'),
      };
    case 'manageInvites':
      return {
        displayName: _t('permissions.names.manageInvites'),
        description: _t('permissions.descriptions.manageInvites'),
      };
    case 'managePosts':
      return {
        displayName: _t('permissions.names.managePosts'),
        description: _t('permissions.descriptions.managePosts'),
      };
    case 'manageRoles':
      return {
        displayName: _t('permissions.names.manageRoles'),
        description: _t('permissions.descriptions.manageRoles'),
      };
    case 'removeGroups':
      return {
        displayName: _t('permissions.names.removeGroups'),
        description: _t('permissions.descriptions.removeGroups'),
      };
    case 'removeMembers':
      return {
        displayName: _t('permissions.names.removeMembers'),
        description: _t('permissions.descriptions.removeMembers'),
      };
    case 'removeProposals':
      return {
        displayName: _t('permissions.names.removeProposals'),
        description: _t('permissions.descriptions.removeProposals'),
      };
    case 'manageRules':
      return {
        displayName: _t('permissions.names.manageRules'),
        description: _t('permissions.descriptions.manageRules'),
      };
    case 'manageQuestions':
      return {
        displayName: _t('permissions.names.manageQuestions'),
        description: _t('permissions.descriptions.manageQuestions'),
      };
    case 'manageQuestionnaireTickets':
      return {
        displayName: _t('permissions.names.manageQuestionnaires'),
        description: _t('permissions.descriptions.manageQuestionnaires'),
      };
  }
};

export const initGroupRolePermissions = (
  enabled = false,
): Omit<GroupPermissions, '__typename'> => ({
  approveMemberRequests: enabled,
  createEvents: enabled,
  deleteGroup: enabled,
  manageComments: enabled,
  manageEvents: enabled,
  managePosts: enabled,
  manageRoles: enabled,
  manageSettings: enabled,
  removeMembers: enabled,
  updateGroup: enabled,
});

export const initServerRolePermissions = (
  enabled = false,
): Omit<ServerPermissions, '__typename'> => ({
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

export const cleanPermissions = <T>(object: T): Partial<T> => {
  if (!object) {
    return {};
  }
  return Object.entries(object)
    .filter(([_, value]) => typeof value === 'boolean')
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});
};
