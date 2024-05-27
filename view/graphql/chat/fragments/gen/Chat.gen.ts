import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ChatFragment = {
  __typename?: 'Conversation';
  id: number;
  name: string;
  unreadMessageCount: number;
  group?: {
    __typename?: 'Group';
    id: number;
    name: string;
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
};

export const ChatFragmentDoc = gql`
  fragment Chat on Conversation {
    id
    name
    unreadMessageCount
    group {
      ...GroupAvatar
    }
  }
  ${GroupAvatarFragmentDoc}
`;
