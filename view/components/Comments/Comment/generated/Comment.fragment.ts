import * as Types from '../../../../apollo/gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../../Images/AttachedImage/generated/AttachedImage.fragment';
import { UserAvatarFragmentDoc } from '../../../Users/UserAvatar/generated/UserAvatar.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type CommentFragment = {
  __typename?: 'Comment';
  id: number;
  body?: string | null;
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
