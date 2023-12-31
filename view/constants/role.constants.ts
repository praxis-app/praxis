import {
  GroupRolePermissionInput,
  ServerRolePermissionInput,
} from '../graphql/gen';

export const DEFAULT_ROLE_COLOR = '#f44336';

export const SERVER_PERMISSION_NAMES: (keyof ServerRolePermissionInput)[] = [
  'manageRoles',
  'manageEvents',
  'manageSettings',
  'managePosts',
  'manageInvites',
  'createInvites',
  'manageComments',
  'removeMembers',
  'removeProposals',
  'removeGroups',
];

export const GROUP_PERMISSION_NAMES: (keyof GroupRolePermissionInput)[] = [
  'manageRoles',
  'manageSettings',
  'managePosts',
  'manageEvents',
  'createEvents',
  'updateGroup',
  'deleteGroup',
  'manageComments',
  'approveMemberRequests',
  'removeMembers',
];

export enum EditRoleTabName {
  Permissions = 'permissions',
  Members = 'members',
}
