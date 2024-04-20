import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ServerRoleFragmentDoc } from './ServerRole.gen';
import { AddServerRoleMemberTabFragmentDoc } from './AddServerRoleMemberTab.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { ServerRolePermissionsFragmentDoc } from './ServerRolePermissions.gen';

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
    manageQuestionnaireTickets: boolean;
    manageQuestions: boolean;
    manageRoles: boolean;
    manageRules: boolean;
    manageSettings: boolean;
    removeGroups: boolean;
    removeMembers: boolean;
    removeProposals: boolean;
  };
  availableUsersToAdd: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
  members: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
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
