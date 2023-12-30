import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type FollowButtonFragment = {
  __typename?: 'User';
  id: number;
  name: string;
  isFollowedByMe: boolean;
};

export const FollowButtonFragmentDoc = gql`
  fragment FollowButton on User {
    id
    name
    isFollowedByMe
  }
`;
