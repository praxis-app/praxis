import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionRoleMemberFragment = {
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

export const ProposalActionRoleMemberFragmentDoc = gql`
  fragment ProposalActionRoleMember on ProposalActionRoleMember {
    id
    changeType
    user {
      ...UserAvatar
    }
  }
  ${UserAvatarFragmentDoc}
`;
