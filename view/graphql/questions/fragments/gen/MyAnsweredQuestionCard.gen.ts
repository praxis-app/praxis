import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type MyAnsweredQuestionCardFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
  priority: number;
  myAnswer?: { __typename?: 'Answer'; id: number; text: string } | null;
};

export const MyAnsweredQuestionCardFragmentDoc = gql`
  fragment MyAnsweredQuestionCard on Question {
    id
    text
    priority
    myAnswer {
      id
      text
    }
  }
`;
