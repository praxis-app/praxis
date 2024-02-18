import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnswerQuestionsFormFieldFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
  priority: number;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
};

export const AnswerQuestionsFormFieldFragmentDoc = gql`
  fragment AnswerQuestionsFormField on Question {
    id
    text
    priority
    likeCount
    commentCount
    isLikedByMe
  }
`;
