import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { MessageFragmentDoc } from './Message.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ChatPanelFragment = {
  __typename?: 'Conversation';
  id: number;
  name: string;
  messages: Array<{
    __typename?: 'Message';
    id: number;
    body?: string | null;
    createdAt: any;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  }>;
};

export const ChatPanelFragmentDoc = gql`
  fragment ChatPanel on Conversation {
    id
    name
    messages(offset: $offset, limit: $limit) {
      ...Message
    }
  }
  ${MessageFragmentDoc}
`;
