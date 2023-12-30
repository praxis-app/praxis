import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerPermissionsFragment = {
  __typename?: 'ServerPermissions';
  createInvites: boolean;
  manageComments: boolean;
  manageEvents: boolean;
  manageInvites: boolean;
  managePosts: boolean;
  manageRoles: boolean;
  manageSettings: boolean;
  removeMembers: boolean;
  removeGroups: boolean;
};

export const ServerPermissionsFragmentDoc = gql`
  fragment ServerPermissions on ServerPermissions {
    createInvites
    manageComments
    manageEvents
    manageInvites
    managePosts
    manageRoles
    manageSettings
    removeMembers
    removeGroups
  }
`;
