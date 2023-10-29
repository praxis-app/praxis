import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerSettingsFormFragment = {
  __typename?: 'ServerConfig';
  id: number;
  canaryStatement?: string | null;
  showCanaryStatement: boolean;
};

export const ServerSettingsFormFragmentDoc = gql`
  fragment ServerSettingsForm on ServerConfig {
    id
    canaryStatement
    showCanaryStatement
  }
`;
