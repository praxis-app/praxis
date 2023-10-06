import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type VoteMenuFragment = {
  __typename?: 'Proposal';
  id: number;
  votes: Array<{
    __typename?: 'Vote';
    id: number;
    voteType: string;
    user: { __typename?: 'User'; id: number };
  }>;
};

export const VoteMenuFragmentDoc = gql`
  fragment VoteMenu on Proposal {
    id
    votes {
      id
      voteType
      user {
        id
      }
    }
  }
`;
