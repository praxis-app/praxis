import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type VoteMenuFragment = {
  __typename?: 'Proposal';
  id: number;
  myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
};

export const VoteMenuFragmentDoc = gql`
  fragment VoteMenu on Proposal {
    id
    myVote @include(if: $isLoggedIn) {
      id
      voteType
    }
  }
`;
