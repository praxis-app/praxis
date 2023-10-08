import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from './UserAvatar.fragment';
import { FollowButtonFragmentDoc } from './FollowButton.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type UserProfileCardFragment = {
  __typename?: 'User';
  id: number;
  bio?: string | null;
  createdAt: any;
  followerCount: number;
  followingCount: number;
  name: string;
  isFollowedByMe: boolean;
  coverPhoto?: { __typename?: 'Image'; id: number } | null;
  profilePicture: { __typename?: 'Image'; id: number };
};

export const UserProfileCardFragmentDoc = gql`
  fragment UserProfileCard on User {
    id
    bio
    createdAt
    followerCount
    followingCount
    coverPhoto {
      id
    }
    ...UserAvatar
    ...FollowButton
  }
  ${UserAvatarFragmentDoc}
  ${FollowButtonFragmentDoc}
`;
