import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type RoleMemberFragment = {
  __typename?: 'User';
  id: number;
  name: string;
  profilePicture: { __typename?: 'Image'; id: number };
};

export const RoleMemberFragmentDoc = gql`
  fragment RoleMember on User {
    id
    ...UserAvatar
  }
  ${UserAvatarFragmentDoc}
`;
