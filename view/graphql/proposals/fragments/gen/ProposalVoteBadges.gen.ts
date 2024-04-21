import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';
import { VoteBadgeFragmentDoc } from '../../../votes/fragments/gen/VoteBadge.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalVoteBadgesFragment = {
  __typename?: 'Proposal';
  id: number;
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
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
};

export const ProposalVoteBadgesFragmentDoc = gql`
  fragment ProposalVoteBadges on Proposal {
    id
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
