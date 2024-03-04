import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { FollowButtonFragmentDoc } from '../../../users/fragments/gen/FollowButton.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type LikeFragment = {
  __typename?: 'Like';
  id: number;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    isFollowedByMe: boolean;
    profilePicture: { __typename?: 'Image'; id: number };
  };
};

export const LikeFragmentDoc = gql`
  fragment Like on Like {
    id
    user {
      ...UserAvatar
      ...FollowButton @include(if: $isVerified)
    }
  }
  ${UserAvatarFragmentDoc}
  ${FollowButtonFragmentDoc}
`;
