import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type CommentFragment = {
  __typename?: 'Comment';
  id: number;
  body?: string | null;
  likeCount: number;
  isLikedByMe?: boolean;
  createdAt: any;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
};

export const CommentFragmentDoc = gql`
  fragment Comment on Comment {
    id
    body
    likeCount
    isLikedByMe @include(if: $isLoggedIn)
    createdAt
    images {
      ...AttachedImage
    }
    user {
      ...UserAvatar
    }
  }
  ${AttachedImageFragmentDoc}
  ${UserAvatarFragmentDoc}
`;
