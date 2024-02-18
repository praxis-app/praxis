import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionFormModalFragment = {
  __typename?: 'ServerQuestion';
  id: number;
  text: string;
};

export const QuestionFormModalFragmentDoc = gql`
  fragment QuestionFormModal on ServerQuestion {
    id
    text
  }
`;
