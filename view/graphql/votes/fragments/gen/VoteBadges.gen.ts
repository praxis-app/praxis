import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { VoteFragmentDoc } from './Vote.gen';
import { VoteBadgeFragmentDoc } from './VoteBadge.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type VoteBadgesFragment = {
  __typename?: 'Proposal';
  id: number;
  voteCount: number;
  settings: {
    __typename?: 'ProposalConfig';
    id: number;
    decisionMakingModel: string;
  };
  votes: Array<{
    __typename?: 'Vote';
    id: number;
    voteType: string;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
};

export const VoteBadgesFragmentDoc = gql`
  fragment VoteBadges on Proposal {
    id
    voteCount
    settings {
      id
      decisionMakingModel
    }
    votes {
      ...Vote
      ...VoteBadge
    }
  }
  ${VoteFragmentDoc}
  ${VoteBadgeFragmentDoc}
`;
