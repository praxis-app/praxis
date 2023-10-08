import {
  GroupRolePermissionInput,
  ServerRolePermissionInput,
} from '../apollo/gen';

export const DEFAULT_ROLE_COLOR = '#f44336';

export const SERVER_PERMISSION_NAMES: (keyof ServerRolePermissionInput)[] = [
  'manageRoles',
  'manageEvents',
  'managePosts',
  'manageInvites',
  'createInvites',
  'manageComments',
  'removeMembers',
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

export enum EditRoleTabNames {
  Permissions = 'permissions',
  Members = 'members',
}
