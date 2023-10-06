import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupPermissionsFragment = {
  __typename?: 'GroupPermissions';
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

export const GroupPermissionsFragmentDoc = gql`
  fragment GroupPermissions on GroupPermissions {
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
