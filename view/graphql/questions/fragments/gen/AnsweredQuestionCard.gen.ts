import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnsweredQuestionCardFragment = {
  __typename?: 'QuestionnaireTicketQuestion';
  id: number;
  text: string;
  priority: number;
  answer?: {
    __typename?: 'Answer';
    id: number;
    text: string;
    likeCount: number;
    commentCount: number;
    isLikedByMe?: boolean;
    user: { __typename?: 'User'; id: number; name: string };
  } | null;
};

export const AnsweredQuestionCardFragmentDoc = gql`
  fragment AnsweredQuestionCard on QuestionnaireTicketQuestion {
    id
    text
    priority
    answer {
      id
      text
      likeCount
      commentCount
      isLikedByMe @include(if: $isLoggedIn)
      user {
        id
        name
      }
    }
  }
`;
