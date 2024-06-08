import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ServerRolePermissionsFragmentDoc } from './ServerRolePermissions.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type RoleViewFragment = {
  __typename?: 'ServerRole';
  id: number;
  name: string;
  color: string;
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
  members: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const RoleViewFragmentDoc = gql`
  fragment RoleView on ServerRole {
    id
    name
    color
    permissions {
      ...ServerRolePermissions
    }
    members {
      ...UserAvatar
    }
  }
  ${ServerRolePermissionsFragmentDoc}
  ${UserAvatarFragmentDoc}
`;
