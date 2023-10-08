import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type VoteBadgeFragment = {
  __typename?: 'Vote';
  id: number;
  voteType: string;
  user: { __typename?: 'User'; id: number };
};

export const VoteBadgeFragmentDoc = gql`
  fragment VoteBadge on Vote {
    id
    voteType
    user {
      id
    }
  }
`;
