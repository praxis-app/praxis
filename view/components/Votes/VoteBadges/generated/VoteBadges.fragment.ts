import * as Types from '../../../../apollo/gen';

import { gql } from '@apollo/client';
import { VoteFragmentDoc } from '../../Vote/generated/Vote.fragment';
import { VoteBadgeFragmentDoc } from '../../VoteBadge/generated/VoteBadge.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type VoteBadgesFragment = {
  __typename?: 'Proposal';
  id: number;
  voteCount: number;
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
    votes {
      ...Vote
      ...VoteBadge
    }
  }
  ${VoteFragmentDoc}
  ${VoteBadgeFragmentDoc}
`;
