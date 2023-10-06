import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../images/generated/AttachedImage.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type PostFormFragment = {
  __typename?: 'Post';
  id: number;
  body?: string | null;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
};

export const PostFormFragmentDoc = gql`
  fragment PostForm on Post {
    id
    body
    images {
      ...AttachedImage
    }
  }
  ${AttachedImageFragmentDoc}
`;
