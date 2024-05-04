import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type NotificationFragment = {
  __typename?: 'Notification';
  id: number;
  status: string;
  notificationType: string;
  unreadMessageCount?: number | null;
  createdAt: any;
  otherUser?: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  } | null;
  post?: { __typename?: 'Post'; id: number } | null;
  proposal?: { __typename?: 'Proposal'; id: number } | null;
  group?: {
    __typename?: 'Group';
    id: number;
    name: string;
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
  conversation?: {
    __typename?: 'Conversation';
    id: number;
    name?: string | null;
  } | null;
  comment?: {
    __typename?: 'Comment';
    id: number;
    body?: string | null;
    post?: { __typename?: 'Post'; id: number } | null;
    proposal?: { __typename?: 'Proposal'; id: number } | null;
    question?: {
      __typename?: 'Question';
      id: number;
      questionnaireTicket: {
        __typename?: 'QuestionnaireTicket';
        id: number;
        user: { __typename?: 'User'; id: number };
      };
    } | null;
    questionnaireTicket?: {
      __typename?: 'QuestionnaireTicket';
      id: number;
      user: { __typename?: 'User'; id: number };
    } | null;
  } | null;
  questionnaireTicket?: {
    __typename?: 'QuestionnaireTicket';
    id: number;
  } | null;
  question?: {
    __typename?: 'Question';
    id: number;
    answer?: { __typename?: 'Answer'; id: number; text: string } | null;
  } | null;
};

export const NotificationFragmentDoc = gql`
  fragment Notification on Notification {
    id
    status
    notificationType
    unreadMessageCount
    createdAt
    otherUser {
      ...UserAvatar
    }
    post {
      id
    }
    proposal {
      id
    }
    group {
      ...GroupAvatar
    }
    conversation {
      id
      name
    }
    comment {
      id
      body
      post {
        id
      }
      proposal {
        id
      }
      question {
        id
        questionnaireTicket {
          id
          user {
            id
          }
        }
      }
      questionnaireTicket {
        id
        user {
          id
        }
      }
    }
    questionnaireTicket {
      id
    }
    question {
      id
      answer {
        id
        text
      }
    }
  }
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
`;
