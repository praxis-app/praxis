import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { MyAnsweredQuestionFragmentDoc } from './MyAnsweredQuestion.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnsweredQuestionsFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  questions: Array<{
    __typename?: 'Question';
    id: number;
    text: string;
    priority: number;
    myAnswer?: { __typename?: 'Answer'; id: number; text: string } | null;
  }>;
};

export const AnsweredQuestionsFragmentDoc = gql`
  fragment AnsweredQuestions on QuestionnaireTicket {
    id
    questions {
      ...MyAnsweredQuestion
    }
  }
  ${MyAnsweredQuestionFragmentDoc}
`;
