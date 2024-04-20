import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type VoteFragment = {
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
};

export const VoteFragmentDoc = gql`
  fragment Vote on Vote {
    id
    voteType
    user {
      ...UserAvatar
    }
  }
  ${UserAvatarFragmentDoc}
`;
