import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

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
  }
  ${UserAvatarFragmentDoc}
`;
