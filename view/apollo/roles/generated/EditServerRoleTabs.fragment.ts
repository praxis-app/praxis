import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ServerRoleFragmentDoc } from './ServerRole.fragment';
import { AddServerRoleMemberTabFragmentDoc } from './AddServerRoleMemberTab.fragment';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import { ServerRolePermissionsFragmentDoc } from './ServerRolePermissions.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EditServerRoleTabsFragment = {
  __typename?: 'ServerRole';
  id: number;
  name: string;
  color: string;
  memberCount: number;
  permissions: {
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
  availableUsersToAdd: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
  members: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const EditServerRoleTabsFragmentDoc = gql`
  fragment EditServerRoleTabs on ServerRole {
    ...ServerRole
    ...AddServerRoleMemberTab
    permissions {
      ...ServerRolePermissions
    }
    availableUsersToAdd {
      ...UserAvatar
    }
  }
  ${ServerRoleFragmentDoc}
  ${AddServerRoleMemberTabFragmentDoc}
  ${ServerRolePermissionsFragmentDoc}
  ${UserAvatarFragmentDoc}
`;
