import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type SharedProposalFragment = {
  __typename?: 'Proposal';
  id: number;
  body?: string | null;
  createdAt: any;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
};

export const SharedProposalFragmentDoc = gql`
  fragment SharedProposal on Proposal {
    id
    body
    createdAt
    images {
      ...AttachedImage
    }
    user {
      ...UserAvatar
    }
  }
  ${AttachedImageFragmentDoc}
  ${UserAvatarFragmentDoc}
`;
