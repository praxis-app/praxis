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
  manageQuestionnaireTickets: boolean;
  manageQuestions: boolean;
  manageRoles: boolean;
  manageRules: boolean;
  manageSettings: boolean;
  removeGroups: boolean;
  removeMembers: boolean;
  removeProposals: boolean;
};

export const ServerPermissionsFragmentDoc = gql`
  fragment ServerPermissions on ServerPermissions {
    createInvites
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
  }
`;
