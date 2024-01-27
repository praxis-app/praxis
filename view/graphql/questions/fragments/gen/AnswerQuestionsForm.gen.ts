import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionFragmentDoc } from './Question.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnswerQuestionsFormFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  questions: Array<{
    __typename?: 'Question';
    id: number;
    text: string;
    myAnswer?: { __typename?: 'Answer'; id: number; text: string } | null;
  }>;
};

export const AnswerQuestionsFormFragmentDoc = gql`
  fragment AnswerQuestionsForm on QuestionnaireTicket {
    id
    questions {
      ...Question
    }
  }
  ${QuestionFragmentDoc}
`;
