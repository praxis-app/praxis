import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AttachedImageFragment = {
  __typename?: 'Image';
  id: number;
  filename: string;
};

export const AttachedImageFragmentDoc = gql`
  fragment AttachedImage on Image {
    id
    filename
  }
`;
