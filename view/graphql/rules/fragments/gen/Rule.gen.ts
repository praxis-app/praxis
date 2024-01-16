import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type RuleFragment = {
  __typename?: 'Rule';
  id: number;
  title: string;
  description: string;
  priority: number;
};

export const RuleFragmentDoc = gql`
  fragment Rule on Rule {
    id
    title
    description
    priority
  }
`;
