import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupAvatarFragment = {
  __typename?: 'Group';
  id: number;
  name: string;
  coverPhoto?: { __typename?: 'Image'; id: number } | null;
};

export const GroupAvatarFragmentDoc = gql`
  fragment GroupAvatar on Group {
    id
    name
    coverPhoto {
      id
    }
  }
`;
