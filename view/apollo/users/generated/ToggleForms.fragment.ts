import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ToggleFormsFragment = {
  __typename?: 'User';
  id: number;
  joinedGroups: Array<{ __typename?: 'Group'; id: number; name: string }>;
};

export const ToggleFormsFragmentDoc = gql`
  fragment ToggleForms on User {
    id
    joinedGroups {
      id
      name
    }
  }
`;
