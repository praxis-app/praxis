import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerRolePermissionsFragment = {
  __typename?: 'ServerRolePermission';
  id: number;
  createInvites: boolean;
  manageComments: boolean;
  manageEvents: boolean;
  manageInvites: boolean;
  managePosts: boolean;
  manageRoles: boolean;
  removeMembers: boolean;
};

export const ServerRolePermissionsFragmentDoc = gql`
  fragment ServerRolePermissions on ServerRolePermission {
    id
    createInvites
    manageComments
    manageEvents
    manageInvites
    managePosts
    manageRoles
    removeMembers
  }
`;
