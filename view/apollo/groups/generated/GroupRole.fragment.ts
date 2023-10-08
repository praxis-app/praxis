import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupRoleFragment = {
  __typename?: 'GroupRole';
  id: number;
  name: string;
  color: string;
  memberCount: number;
  group: { __typename?: 'Group'; id: number; name: string };
};

export const GroupRoleFragmentDoc = gql`
  fragment GroupRole on GroupRole {
    id
    name
    color
    memberCount
    group {
      id
      name
    }
  }
`;
