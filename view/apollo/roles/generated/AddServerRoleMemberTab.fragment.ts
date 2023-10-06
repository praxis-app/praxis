import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { RoleMemberFragmentDoc } from './RoleMember.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AddServerRoleMemberTabFragment = {
  __typename?: 'ServerRole';
  id: number;
  members: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const AddServerRoleMemberTabFragmentDoc = gql`
  fragment AddServerRoleMemberTab on ServerRole {
    id
    members {
      ...RoleMember
    }
  }
  ${RoleMemberFragmentDoc}
`;
