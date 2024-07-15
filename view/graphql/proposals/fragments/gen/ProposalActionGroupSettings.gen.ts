import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionGroupSettingsFragment = {
  __typename?: 'ProposalActionGroupConfig';
  id: number;
  adminModel?: string | null;
  decisionMakingModel?: Types.DecisionMakingModel | null;
  ratificationThreshold?: number | null;
  reservationsLimit?: number | null;
  standAsidesLimit?: number | null;
  votingTimeLimit?: number | null;
  privacy?: string | null;
  oldAdminModel?: string | null;
  oldDecisionMakingModel?: Types.DecisionMakingModel | null;
  oldRatificationThreshold?: number | null;
  oldReservationsLimit?: number | null;
  oldStandAsidesLimit?: number | null;
  oldVotingTimeLimit?: number | null;
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
        settings: {
          __typename?: 'GroupConfig';
          id: number;
          adminModel: string;
          decisionMakingModel: Types.DecisionMakingModel;
          ratificationThreshold: number;
          reservationsLimit: number;
          standAsidesLimit: number;
          votingTimeLimit: number;
          privacy: string;
        };
      } | null;
    };
  };
};

export const ProposalActionGroupSettingsFragmentDoc = gql`
  fragment ProposalActionGroupSettings on ProposalActionGroupConfig {
    id
    adminModel
    decisionMakingModel
    ratificationThreshold
    reservationsLimit
    standAsidesLimit
    votingTimeLimit
    privacy
    oldAdminModel
    oldDecisionMakingModel
    oldRatificationThreshold
    oldReservationsLimit
    oldStandAsidesLimit
    oldVotingTimeLimit
    oldPrivacy
    proposalAction {
      id
      proposal {
        id
        group {
          id
          settings {
            id
            adminModel
            decisionMakingModel
            ratificationThreshold
            reservationsLimit
            standAsidesLimit
            votingTimeLimit
            privacy
          }
        }
      }
    }
  }
`;
