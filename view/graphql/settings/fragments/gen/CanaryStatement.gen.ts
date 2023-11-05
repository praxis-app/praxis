import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type CanaryStatementFragment = {
  __typename?: 'Canary';
  id: number;
  statement: string;
  updatedAt: any;
};

export const CanaryStatementFragmentDoc = gql`
  fragment CanaryStatement on Canary {
    id
    statement
    updatedAt
  }
`;
