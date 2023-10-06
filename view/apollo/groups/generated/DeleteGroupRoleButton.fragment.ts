import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type DeleteGroupRoleButtonFragment = {
  __typename?: 'GroupRole';
  id: number;
  group: { __typename?: 'Group'; id: number; name: string };
};

export const DeleteGroupRoleButtonFragmentDoc = gql`
  fragment DeleteGroupRoleButton on GroupRole {
    id
    group {
      id
      name
    }
  }
`;
