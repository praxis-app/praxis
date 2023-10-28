import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerSettingsFormFragment = {
  __typename?: 'ServerConfig';
  id: number;
  canaryMessage?: string | null;
  showCanaryMessage: boolean;
  canaryMessageExpiresAt?: any | null;
};

export const ServerSettingsFormFragmentDoc = gql`
  fragment ServerSettingsForm on ServerConfig {
    id
    canaryMessage
    showCanaryMessage
    canaryMessageExpiresAt
  }
`;
