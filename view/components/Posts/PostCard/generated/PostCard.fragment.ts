import * as Types from '../../../../apollo/gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../../Images/AttachedImage/generated/AttachedImage.fragment';
import { UserAvatarFragmentDoc } from '../../../Users/UserAvatar/generated/UserAvatar.fragment';
import { GroupAvatarFragmentDoc } from '../../../Groups/GroupAvatar/generated/GroupAvatar.fragment';
import { GroupPermissionsFragmentDoc } from '../../../Groups/GroupRoles/GroupRoleForm/graphql/generated/GroupPermissions.fragment';
import { EventAvatarFragmentDoc } from '../../../Events/EventAvatar/generated/EventAvatar.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type PostCardFragment = {
  __typename?: 'Post';
  id: number;
  body?: string | null;
  likesCount: number;
  commentCount: number;
  isLikedByMe?: boolean;
  createdAt: any;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
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
};

export const PostCardFragmentDoc = gql`
  fragment PostCard on Post {
    id
    body
    likesCount
    commentCount
    isLikedByMe @include(if: $isLoggedIn)
    createdAt
    images {
      ...AttachedImage
    }
    user {
      ...UserAvatar
    }
    group {
      ...GroupAvatar
      myPermissions @include(if: $isLoggedIn) {
        ...GroupPermissions
      }
      isJoinedByMe @include(if: $isLoggedIn)
    }
    event {
      ...EventAvatar
      group @include(if: $isLoggedIn) {
        id
        isJoinedByMe
      }
    }
  }
  ${AttachedImageFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
  ${EventAvatarFragmentDoc}
`;
