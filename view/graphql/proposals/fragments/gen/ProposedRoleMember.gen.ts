import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposedRoleMemberFragment = {
  __typename?: 'ProposalActionRoleMember';
  id: number;
  changeType: string;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
};

export const ProposedRoleMemberFragmentDoc = gql`
  fragment ProposedRoleMember on ProposalActionRoleMember {
    id
    changeType
    user {
      ...UserAvatar
    }
  }
  ${UserAvatarFragmentDoc}
`;
