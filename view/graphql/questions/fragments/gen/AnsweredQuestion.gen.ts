import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AnsweredQuestionCardFooterFragmentDoc } from './AnsweredQuestionCardFooter.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnsweredQuestionFragment = {
  __typename?: 'Question';
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
  } | null;
};

export const AnsweredQuestionFragmentDoc = gql`
  fragment AnsweredQuestion on Question {
    id
    text
    priority
    answer(questionnaireTicketId: $questionnaireTicketId) {
      id
      text
    }
    ...AnsweredQuestionCardFooter
  }
  ${AnsweredQuestionCardFooterFragmentDoc}
`;
