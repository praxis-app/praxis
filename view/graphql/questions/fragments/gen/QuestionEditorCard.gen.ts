import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionFormModalFragmentDoc } from './QuestionFormModal.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionEditorCardFragment = {
  __typename?: 'ServerQuestion';
  id: number;
  text: string;
  priority: number;
};

export const QuestionEditorCardFragmentDoc = gql`
  fragment QuestionEditorCard on ServerQuestion {
    id
    text
    priority
    ...QuestionFormModal
  }
  ${QuestionFormModalFragmentDoc}
`;
