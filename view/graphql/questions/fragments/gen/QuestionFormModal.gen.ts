import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionFormModalFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
};

export const QuestionFormModalFragmentDoc = gql`
  fragment QuestionFormModal on Question {
    id
    text
  }
`;
