import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupRoleFragmentDoc } from './GroupRole.gen';
import { AddGroupRoleMemberTabFragmentDoc } from './AddGroupRoleMemberTab.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { DeleteGroupRoleButtonFragmentDoc } from './DeleteGroupRoleButton.gen';
import { GroupRolePermissionsFragmentDoc } from './GroupRolePermissions.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EditGroupRoleTabsFragment = {
  __typename?: 'GroupRole';
  id: number;
  name: string;
  color: string;
  memberCount: number;
  permissions: {
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
  availableUsersToAdd: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
  group: { __typename?: 'Group'; id: number; name: string };
  members: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const EditGroupRoleTabsFragmentDoc = gql`
  fragment EditGroupRoleTabs on GroupRole {
    ...GroupRole
    ...AddGroupRoleMemberTab
    ...DeleteGroupRoleButton
    permissions {
      ...GroupRolePermissions
    }
    availableUsersToAdd {
      ...UserAvatar
    }
  }
  ${GroupRoleFragmentDoc}
  ${AddGroupRoleMemberTabFragmentDoc}
  ${DeleteGroupRoleButtonFragmentDoc}
  ${GroupRolePermissionsFragmentDoc}
  ${UserAvatarFragmentDoc}
`;
