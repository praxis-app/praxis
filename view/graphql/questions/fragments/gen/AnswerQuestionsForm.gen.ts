import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AnswerQuestionsFormFieldFragmentDoc } from './AnswerQuestionsFormField.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnswerQuestionsFormFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  questions: Array<{
    __typename?: 'Question';
    id: number;
    text: string;
    answer?: { __typename?: 'Answer'; id: number; text: string } | null;
  }>;
};

export const AnswerQuestionsFormFragmentDoc = gql`
  fragment AnswerQuestionsForm on QuestionnaireTicket {
    id
    questions {
      answer {
        id
        text
      }
      ...AnswerQuestionsFormField
    }
  }
  ${AnswerQuestionsFormFieldFragmentDoc}
`;
