import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from './UserAvatar.gen';
import { FollowButtonFragmentDoc } from './FollowButton.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type UserEntryFragment = {
  __typename?: 'User';
  id: number;
  isVerified: boolean;
  name: string;
  displayName?: string | null;
  isFollowedByMe: boolean;
  profilePicture: { __typename?: 'Image'; id: number };
};

export const UserEntryFragmentDoc = gql`
  fragment UserEntry on User {
    id
    isVerified
    ...UserAvatar
    ...FollowButton
  }
  ${UserAvatarFragmentDoc}
  ${FollowButtonFragmentDoc}
`;
