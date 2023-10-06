import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupSettingsFormFragment = {
  __typename?: 'Group';
  id: number;
  settings: { __typename?: 'GroupConfig'; id: number; isPublic: boolean };
};

export const GroupSettingsFormFragmentDoc = gql`
  fragment GroupSettingsForm on Group {
    id
    settings {
      id
      isPublic
    }
  }
`;
