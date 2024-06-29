import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';
import { GroupPermissionsFragmentDoc } from '../../../groups/fragments/gen/GroupPermissions.gen';
import { EventAvatarFragmentDoc } from '../../../events/fragments/gen/EventAvatar.gen';
import { SharedPostFragmentDoc } from './SharedPost.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type PostCardFragment = {
  __typename?: 'Post';
  id: number;
  body?: string | null;
  likeCount: number;
  commentCount: number;
  isLikedByMe?: boolean;
  hasMissingSharedPost: boolean;
  createdAt: any;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  group?: {
    __typename?: 'Group';
    isJoinedByMe?: boolean;
    id: number;
    name: string;
    myPermissions?: {
      __typename?: 'GroupPermissions';
      approveMemberRequests: boolean;
      createEvents: boolean;
      deleteGroup: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      managePosts: boolean;
      manageRoles: boolean;
      manageSettings: boolean;
      removeMembers: boolean;
      updateGroup: boolean;
    };
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
  event?: {
    __typename?: 'Event';
    id: number;
    name: string;
    group?: { __typename?: 'Group'; id: number; isJoinedByMe: boolean } | null;
    coverPhoto: { __typename?: 'Image'; id: number };
  } | null;
  sharedPost?: {
    __typename?: 'Post';
    id: number;
    body?: string | null;
    createdAt: any;
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  } | null;
};

export const PostCardFragmentDoc = gql`
  fragment PostCard on Post {
    id
    body
    likeCount
    commentCount
    isLikedByMe @include(if: $isVerified)
    hasMissingSharedPost
    createdAt
    images {
      ...AttachedImage
    }
    user {
      ...UserAvatar
    }
    group {
      ...GroupAvatar
      myPermissions @include(if: $isVerified) {
        ...GroupPermissions
      }
      isJoinedByMe @include(if: $isVerified)
    }
    event {
      ...EventAvatar
      group @include(if: $isVerified) {
        id
        isJoinedByMe
      }
    }
    sharedPost {
      ...SharedPost
    }
  }
  ${AttachedImageFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
  ${EventAvatarFragmentDoc}
  ${SharedPostFragmentDoc}
`;
