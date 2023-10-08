import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionEventFragment = {
  __typename?: 'ProposalActionEvent';
  id: number;
  name: string;
  description: string;
  location?: string | null;
  online: boolean;
  startsAt: any;
  endsAt?: any | null;
  externalLink?: string | null;
  coverPhoto?: { __typename?: 'Image'; id: number } | null;
  host: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  proposalAction: {
    __typename?: 'ProposalAction';
    id: number;
    proposal: {
      __typename?: 'Proposal';
      id: number;
      group?: { __typename?: 'Group'; id: number; name: string } | null;
    };
  };
};

export const ProposalActionEventFragmentDoc = gql`
  fragment ProposalActionEvent on ProposalActionEvent {
    id
    name
    description
    location
    online
    startsAt
    endsAt
    externalLink
    coverPhoto {
      id
    }
    host {
      ...UserAvatar
    }
    proposalAction {
      id
      proposal {
        id
        group {
          id
          name
        }
      }
    }
  }
  ${UserAvatarFragmentDoc}
`;
