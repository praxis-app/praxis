import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EventAvatarFragment = {
  __typename?: 'Event';
  id: number;
  name: string;
  coverPhoto: { __typename?: 'Image'; id: number };
};

export const EventAvatarFragmentDoc = gql`
  fragment EventAvatar on Event {
    id
    name
    coverPhoto {
      id
    }
  }
`;
