import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { RuleFormFragmentDoc } from './RuleForm.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type RuleFragment = {
  __typename?: 'Rule';
  id: number;
  title: string;
  description: string;
  priority: number;
  updatedAt: any;
};

export const RuleFragmentDoc = gql`
  fragment Rule on Rule {
    id
    title
    description
    priority
    updatedAt
    ...RuleForm
  }
  ${RuleFormFragmentDoc}
`;
