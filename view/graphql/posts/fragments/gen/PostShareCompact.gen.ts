import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';
import { EventAvatarFragmentDoc } from '../../../events/fragments/gen/EventAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type PostShareCompactFragment = {
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
  group?: {
    __typename?: 'Group';
    id: number;
    name: string;
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
  event?: {
    __typename?: 'Event';
    id: number;
    name: string;
    coverPhoto: { __typename?: 'Image'; id: number };
  } | null;
};

export const PostShareCompactFragmentDoc = gql`
  fragment PostShareCompact on Post {
    id
    likeCount
    shareCount
    isLikedByMe @include(if: $isVerified)
    createdAt
    user {
      ...UserAvatar
    }
    group {
      ...GroupAvatar
    }
    event {
      ...EventAvatar
    }
  }
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
  ${EventAvatarFragmentDoc}
`;
