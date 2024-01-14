import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CommentLikeButtonFragmentDoc } from './CommentLikeButton.gen';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type CommentFragment = {
  __typename?: 'Comment';
  id: number;
  body?: string | null;
  likeCount: number;
  createdAt: any;
  isLikedByMe?: boolean;
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
    createdAt
    ...CommentLikeButton
    images {
      ...AttachedImage
    }
    user {
      ...UserAvatar
    }
  }
  ${CommentLikeButtonFragmentDoc}
  ${AttachedImageFragmentDoc}
  ${UserAvatarFragmentDoc}
`;
