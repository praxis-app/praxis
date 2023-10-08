import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupFormFragment = {
  __typename?: 'Group';
  id: number;
  name: string;
  description: string;
};

export const GroupFormFragmentDoc = gql`
  fragment GroupForm on Group {
    id
    name
    description
  }
`;
