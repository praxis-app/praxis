import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionPermissionFragment = {
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

export const ProposalActionPermissionFragmentDoc = gql`
  fragment ProposalActionPermission on ProposalActionPermission {
    id
    approveMemberRequests
    createEvents
    createInvites
    deleteGroup
    manageComments
    manageEvents
    manageInvites
    managePosts
    manageQuestionnaireTickets
    manageQuestions
    manageRoles
    manageRules
    manageSettings
    removeGroups
    removeMembers
    removeProposals
    updateGroup
  }
`;
