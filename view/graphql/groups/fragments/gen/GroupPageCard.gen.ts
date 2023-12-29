import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupPageCardFragment = {
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
  settings: {
    __typename?: 'GroupConfig';
    id: number;
    isPublic: boolean;
    adminModel: string;
  };
};

export const GroupPageCardFragmentDoc = gql`
  fragment GroupPageCard on Group {
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
      id
      isPublic
      adminModel
    }
  }
  ${GroupPermissionsFragmentDoc}
`;
