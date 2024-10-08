import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ProposalActionPermissionFragmentDoc } from './ProposalActionPermission.gen';
import { ProposalActionRoleMemberFragmentDoc } from './ProposalActionRoleMember.gen';

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
    createInvites?: boolean | null;
    deleteGroup?: boolean | null;
    manageComments?: boolean | null;
    manageEvents?: boolean | null;
    manageInvites?: boolean | null;
    managePosts?: boolean | null;
    manageQuestionnaireTickets?: boolean | null;
    manageQuestions?: boolean | null;
    manageRoles?: boolean | null;
    manageRules?: boolean | null;
    manageSettings?: boolean | null;
    removeGroups?: boolean | null;
    removeMembers?: boolean | null;
    removeProposals?: boolean | null;
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
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }> | null;
  groupRole?: {
    __typename?: 'GroupRole';
    id: number;
    name: string;
    color: string;
  } | null;
  serverRole?: {
    __typename?: 'ServerRole';
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
    serverRole {
      id
      name
      color
    }
  }
  ${ProposalActionPermissionFragmentDoc}
  ${ProposalActionRoleMemberFragmentDoc}
`;
