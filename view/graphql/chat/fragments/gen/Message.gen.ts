import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type MessageFragment = {
  __typename?: 'Message';
  id: number;
  body?: string | null;
};

export const MessageFragmentDoc = gql`
  fragment Message on Message {
    id
    body
  }
`;
