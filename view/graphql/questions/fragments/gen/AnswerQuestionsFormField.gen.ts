import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AnswerQuestionsFormFieldFragment = {
  __typename?: 'QuestionnaireTicketQuestion';
  id: number;
  text: string;
};

export const AnswerQuestionsFormFieldFragmentDoc = gql`
  fragment AnswerQuestionsFormField on QuestionnaireTicketQuestion {
    id
    text
  }
`;
