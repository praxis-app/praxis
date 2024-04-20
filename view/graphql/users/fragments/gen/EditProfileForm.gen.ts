import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EditProfileFormFragment = {
  __typename?: 'User';
  id: number;
  bio?: string | null;
  name: string;
  displayName?: string | null;
  profilePicture: { __typename?: 'Image'; id: number };
  coverPhoto?: { __typename?: 'Image'; id: number } | null;
};

export const EditProfileFormFragmentDoc = gql`
  fragment EditProfileForm on User {
    id
    bio
    name
    displayName
    profilePicture {
      id
    }
    coverPhoto {
      id
    }
  }
`;
