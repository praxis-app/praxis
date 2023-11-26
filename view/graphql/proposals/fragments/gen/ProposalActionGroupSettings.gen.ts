import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionGroupSettingsFragment = {
  __typename?: 'ProposalActionGroupConfig';
  id: number;
  privacy?: string | null;
  oldPrivacy?: string | null;
  proposalAction: {
    __typename?: 'ProposalAction';
    id: number;
    proposal: {
      __typename?: 'Proposal';
      id: number;
      group?: {
        __typename?: 'Group';
        id: number;
        settings: { __typename?: 'GroupConfig'; id: number; privacy: string };
      } | null;
    };
  };
};

export const ProposalActionGroupSettingsFragmentDoc = gql`
  fragment ProposalActionGroupSettings on ProposalActionGroupConfig {
    id
    privacy
    oldPrivacy
    proposalAction {
      id
      proposal {
        id
        group {
          id
          settings {
            id
            privacy
          }
        }
      }
    }
  }
`;
