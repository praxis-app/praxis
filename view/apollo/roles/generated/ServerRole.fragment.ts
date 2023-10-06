import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerRoleFragment = {
  __typename?: 'ServerRole';
  id: number;
  name: string;
  color: string;
  memberCount: number;
};

export const ServerRoleFragmentDoc = gql`
  fragment ServerRole on ServerRole {
    id
    name
    color
    memberCount
  }
`;
