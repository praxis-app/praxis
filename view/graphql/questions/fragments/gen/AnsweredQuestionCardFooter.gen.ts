import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnsweredQuestionCardFooterFragment = {
  __typename?: 'Question';
  id: number;
  answer?: {
    __typename?: 'Answer';
    id: number;
    likeCount: number;
    commentCount: number;
  } | null;
};

export const AnsweredQuestionCardFooterFragmentDoc = gql`
  fragment AnsweredQuestionCardFooter on Question {
    id
    answer(questionnaireTicketId: $questionnaireTicketId) {
      id
      likeCount
      commentCount
    }
  }
`;
