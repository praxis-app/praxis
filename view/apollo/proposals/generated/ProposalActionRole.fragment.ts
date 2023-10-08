import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ProposalActionPermissionFragmentDoc } from './ProposalActionPermission.fragment';
import { ProposalActionRoleMemberFragmentDoc } from './ProposalActionRoleMember.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionRoleFragment = {
  __typename?: 'ProposalActionRole';
  id: number;
  name?: string | null;
  color?: string | null;
  oldName?: string | null;
  oldColor?: string | null;
  permissions: {
    __typename?: 'ProposalActionPermission';
    id: number;
    approveMemberRequests?: boolean | null;
    createEvents?: boolean | null;
    deleteGroup?: boolean | null;
    manageComments?: boolean | null;
    manageEvents?: boolean | null;
    managePosts?: boolean | null;
    manageRoles?: boolean | null;
    manageSettings?: boolean | null;
    removeMembers?: boolean | null;
    updateGroup?: boolean | null;
  };
  members?: Array<{
    __typename?: 'ProposalActionRoleMember';
    id: number;
    changeType: string;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }> | null;
  groupRole?: {
    __typename?: 'GroupRole';
    id: number;
    name: string;
    color: string;
  } | null;
};

export const ProposalActionRoleFragmentDoc = gql`
  fragment ProposalActionRole on ProposalActionRole {
    id
    name
    color
    oldName
    oldColor
    permissions {
      ...ProposalActionPermission
    }
    members {
      ...ProposalActionRoleMember
    }
    groupRole {
      id
      name
      color
    }
  }
  ${ProposalActionPermissionFragmentDoc}
  ${ProposalActionRoleMemberFragmentDoc}
`;
