import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionGroupSettingsFragment = {
  __typename?: 'ProposalActionGroupConfig';
  id: number;
  privacy?: string | null;
  ratificationThreshold?: number | null;
  reservationsLimit?: number | null;
  standAsidesLimit?: number | null;
  oldPrivacy?: string | null;
  oldRatificationThreshold?: number | null;
  oldReservationsLimit?: number | null;
  oldStandAsidesLimit?: number | null;
  proposalAction: {
    __typename?: 'ProposalAction';
    id: number;
    proposal: {
      __typename?: 'Proposal';
      id: number;
      group?: {
        __typename?: 'Group';
        id: number;
        settings: {
          __typename?: 'GroupConfig';
          id: number;
          privacy: string;
          ratificationThreshold: number;
          reservationsLimit: number;
          standAsidesLimit: number;
        };
      } | null;
    };
  };
};

export const ProposalActionGroupSettingsFragmentDoc = gql`
  fragment ProposalActionGroupSettings on ProposalActionGroupConfig {
    id
    privacy
    ratificationThreshold
    reservationsLimit
    standAsidesLimit
    oldPrivacy
    oldRatificationThreshold
    oldReservationsLimit
    oldStandAsidesLimit
    proposalAction {
      id
      proposal {
        id
        group {
          id
          settings {
            id
            privacy
            ratificationThreshold
            reservationsLimit
            standAsidesLimit
          }
        }
      }
    }
  }
`;
