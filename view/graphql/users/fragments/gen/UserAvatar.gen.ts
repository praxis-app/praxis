import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type UserAvatarFragment = {
  __typename?: 'User';
  id: number;
  name: string;
  displayName?: string | null;
  profilePicture: { __typename?: 'Image'; id: number };
};

export const UserAvatarFragmentDoc = gql`
  fragment UserAvatar on User {
    id
    name
    displayName
    profilePicture {
      id
    }
  }
`;
