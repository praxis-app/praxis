import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type MyAnsweredQuestionFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
  priority: number;
  myAnswer?: { __typename?: 'Answer'; id: number; text: string } | null;
};

export const MyAnsweredQuestionFragmentDoc = gql`
  fragment MyAnsweredQuestion on Question {
    id
    text
    priority
    myAnswer {
      id
      text
    }
  }
`;
