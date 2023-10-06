import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type TopNavDropdownFragment = {
  __typename?: 'User';
  id: number;
  name: string;
  serverPermissions: { __typename?: 'ServerPermissions'; manageRoles: boolean };
};

export const TopNavDropdownFragmentDoc = gql`
  fragment TopNavDropdown on User {
    id
    name
    serverPermissions {
      manageRoles
    }
  }
`;
