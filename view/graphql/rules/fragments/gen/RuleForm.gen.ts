import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type RuleFormFragment = {
  __typename?: 'Rule';
  id: number;
  title: string;
  description: string;
};

export const RuleFormFragmentDoc = gql`
  fragment RuleForm on Rule {
    id
    title
    description
  }
`;
