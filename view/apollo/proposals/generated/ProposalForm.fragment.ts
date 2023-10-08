import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../images/generated/AttachedImage.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalFormFragment = {
  __typename?: 'Proposal';
  id: number;
  body?: string | null;
  action: {
    __typename?: 'ProposalAction';
    id: number;
    actionType: string;
    groupDescription?: string | null;
    groupName?: string | null;
    groupCoverPhoto?: {
      __typename?: 'Image';
      id: number;
      filename: string;
    } | null;
    role?: { __typename?: 'ProposalActionRole'; id: number } | null;
  };
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
};

export const ProposalFormFragmentDoc = gql`
  fragment ProposalForm on Proposal {
    id
    body
    action {
      id
      actionType
      groupDescription
      groupName
      groupCoverPhoto {
        ...AttachedImage
      }
      role {
        id
      }
    }
    images {
      ...AttachedImage
    }
  }
  ${AttachedImageFragmentDoc}
`;
