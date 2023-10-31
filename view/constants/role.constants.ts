import {
  GroupRolePermissionInput,
  ServerRolePermissionInput,
} from '../graphql/gen';

export const DEFAULT_ROLE_COLOR = '#f44336';

export const SERVER_PERMISSION_NAMES: (keyof ServerRolePermissionInput)[] = [
  'createInvites',
  'manageComments',
  'manageEvents',
  'manageInvites',
  'managePosts',
  'manageRoles',
  'manageSettings',
  'removeMembers',
];

export const GROUP_PERMISSION_NAMES: (keyof GroupRolePermissionInput)[] = [
  'approveMemberRequests',
  'createEvents',
  'deleteGroup',
  'manageComments',
  'manageEvents',
  'managePosts',
  'manageRoles',
  'manageSettings',
  'removeMembers',
  'updateGroup',
];

export enum EditRoleTabNames {
  Permissions = 'permissions',
  Members = 'members',
}
