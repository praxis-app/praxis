import * as Types from '../../../../apollo/gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../Users/UserAvatar/generated/UserAvatar.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type MemberRequestFragment = {
  __typename?: 'GroupMemberRequest';
  id: number;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  group: { __typename?: 'Group'; id: number };
};

export const MemberRequestFragmentDoc = gql`
  fragment MemberRequest on GroupMemberRequest {
    id
    user {
      ...UserAvatar
    }
    group {
      id
    }
  }
  ${UserAvatarFragmentDoc}
`;
