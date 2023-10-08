import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionEventAvatarFragment = {
  __typename?: 'ProposalActionEvent';
  id: number;
  name: string;
  coverPhoto?: { __typename?: 'Image'; id: number } | null;
};

export const ProposalActionEventAvatarFragmentDoc = gql`
  fragment ProposalActionEventAvatar on ProposalActionEvent {
    id
    name
    coverPhoto {
      id
    }
  }
`;
