import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type MessageFragment = {
  __typename?: 'Message';
  id: number;
  body?: string | null;
  createdAt: any;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
};

export const MessageFragmentDoc = gql`
  fragment Message on Message {
    id
    body
    createdAt
    user {
      ...UserAvatar
    }
    images {
      ...AttachedImage
    }
  }
  ${UserAvatarFragmentDoc}
  ${AttachedImageFragmentDoc}
`;
