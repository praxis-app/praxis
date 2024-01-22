import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
};

export const QuestionFragmentDoc = gql`
  fragment Question on Question {
    id
    text
  }
`;
