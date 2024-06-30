import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type PostSharesModalFragment = {
  __typename?: 'Post';
  id: number;
  shares: Array<{
    __typename?: 'Post';
    id: number;
    likeCount: number;
    shareCount: number;
    isLikedByMe?: boolean;
    createdAt: any;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
};

export const PostSharesModalFragmentDoc = gql`
  fragment PostSharesModal on Post {
    id
    shares {
      id
      likeCount
      shareCount
      isLikedByMe @include(if: $isVerified)
      createdAt
      user {
        ...UserAvatar
      }
    }
  }
  ${UserAvatarFragmentDoc}
`;
