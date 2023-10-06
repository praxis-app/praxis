import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupProfileCardFragment = {
  __typename?: 'Group';
  id: number;
  name: string;
  memberCount: number;
  memberRequestCount?: number | null;
  isJoinedByMe?: boolean;
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
  settings: { __typename?: 'GroupConfig'; isPublic: boolean };
};

export const GroupProfileCardFragmentDoc = gql`
  fragment GroupProfileCard on Group {
    id
    name
    memberCount
    memberRequestCount @include(if: $isLoggedIn)
    isJoinedByMe @include(if: $isLoggedIn)
    myPermissions @include(if: $isLoggedIn) {
      ...GroupPermissions
    }
    coverPhoto {
      id
    }
    settings {
      isPublic
    }
  }
  ${GroupPermissionsFragmentDoc}
`;
