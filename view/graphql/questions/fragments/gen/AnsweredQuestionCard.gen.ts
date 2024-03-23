import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnsweredQuestionCardFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
  priority: number;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  answer?: {
    __typename?: 'Answer';
    id: number;
    text: string;
    updatedAt: any;
    user: { __typename?: 'User'; id: number; name: string };
  } | null;
};

export const AnsweredQuestionCardFragmentDoc = gql`
  fragment AnsweredQuestionCard on Question {
    id
    text
    priority
    likeCount
    commentCount
    isLikedByMe
    answer {
      id
      text
      updatedAt
      user {
        id
        name
      }
    }
  }
`;
