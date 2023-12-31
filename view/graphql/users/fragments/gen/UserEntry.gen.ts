import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from './UserAvatar.gen';
import { FollowButtonFragmentDoc } from './FollowButton.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type UserEntryFragment = {
  __typename?: 'User';
  id: number;
  name: string;
  isFollowedByMe: boolean;
  profilePicture: { __typename?: 'Image'; id: number };
};

export const UserEntryFragmentDoc = gql`
  fragment UserEntry on User {
    id
    ...UserAvatar
    ...FollowButton
  }
  ${UserAvatarFragmentDoc}
  ${FollowButtonFragmentDoc}
`;
