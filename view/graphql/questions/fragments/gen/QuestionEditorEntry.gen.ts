import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionFormModalFragmentDoc } from './QuestionFormModal.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionEditorEntryFragment = {
  __typename?: 'Question';
  id: number;
  text: string;
  priority: number;
};

export const QuestionEditorEntryFragmentDoc = gql`
  fragment QuestionEditorEntry on Question {
    id
    text
    priority
    ...QuestionFormModal
  }
  ${QuestionFormModalFragmentDoc}
`;
