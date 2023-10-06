import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupAvatarFragmentDoc } from './GroupAvatar.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupCardFragment = {
  __typename?: 'Group';
  description: string;
  memberCount: number;
  memberRequestCount?: number | null;
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
};

export const GroupCardFragmentDoc = gql`
  fragment GroupCard on Group {
    ...GroupAvatar
    description
    memberCount
    memberRequestCount @include(if: $isLoggedIn)
    isJoinedByMe @include(if: $isLoggedIn)
    myPermissions @include(if: $isLoggedIn) {
      ...GroupPermissions
    }
  }
  ${GroupAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;
