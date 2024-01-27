import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnswerQuestionsFormFieldFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
  myAnswer?: { __typename?: 'Answer'; id: number; text: string } | null;
};

export const AnswerQuestionsFormFieldFragmentDoc = gql`
  fragment AnswerQuestionsFormField on Question {
    id
    text
    myAnswer {
      id
      text
    }
  }
`;
