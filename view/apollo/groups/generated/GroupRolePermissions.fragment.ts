import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupRolePermissionsFragment = {
  __typename?: 'GroupRolePermission';
  id: number;
  approveMemberRequests: boolean;
  createEvents: boolean;
  deleteGroup: boolean;
  manageComments: boolean;
  manageEvents: boolean;
  managePosts: boolean;
  manageRoles: boolean;
  manageSettings: boolean;
  removeMembers: boolean;
  updateGroup: boolean;
};

export const GroupRolePermissionsFragmentDoc = gql`
  fragment GroupRolePermissions on GroupRolePermission {
    id
    approveMemberRequests
    createEvents
    deleteGroup
    manageComments
    manageEvents
    managePosts
    manageRoles
    manageSettings
    removeMembers
    updateGroup
  }
`;
