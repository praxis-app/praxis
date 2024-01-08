import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type NotificationFragment = {
  __typename?: 'Notification';
  id: number;
  actionType: string;
  status: string;
  createdAt: any;
  otherUser?: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  } | null;
  proposal?: { __typename?: 'Proposal'; id: number } | null;
  post?: { __typename?: 'Post'; id: number } | null;
  group?: {
    __typename?: 'Group';
    id: number;
    name: string;
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
};

export const NotificationFragmentDoc = gql`
  fragment Notification on Notification {
    id
    actionType
    status
    createdAt
    otherUser {
      ...UserAvatar
    }
    proposal {
      id
    }
    post {
      id
    }
    group {
      ...GroupAvatar
    }
  }
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
`;
