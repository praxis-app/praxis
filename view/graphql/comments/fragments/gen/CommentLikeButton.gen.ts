import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type CommentLikeButtonFragment = {
  __typename?: 'Comment';
  id: number;
  isLikedByMe?: boolean;
};

export const CommentLikeButtonFragmentDoc = gql`
  fragment CommentLikeButton on Comment {
    id
    isLikedByMe @include(if: $isLoggedIn)
  }
`;
