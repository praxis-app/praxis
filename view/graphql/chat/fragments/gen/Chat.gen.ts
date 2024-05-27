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
  lastMessageSent?: {
    __typename?: 'Message';
    id: number;
    body?: string | null;
    user: { __typename?: 'User'; id: number; name: string };
  } | null;
  group?: {
    __typename?: 'Group';
    description: string;
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
    lastMessageSent {
      id
      body
      user {
        id
        name
      }
    }
    group {
      ...GroupAvatar
      description
    }
  }
  ${GroupAvatarFragmentDoc}
`;
