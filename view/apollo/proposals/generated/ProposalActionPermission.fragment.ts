import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionPermissionFragment = {
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

export const ProposalActionPermissionFragmentDoc = gql`
  fragment ProposalActionPermission on ProposalActionPermission {
    id
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
