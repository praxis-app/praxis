import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerSettingsFormFragment = {
  __typename?: 'ServerConfig';
  id: number;
  serverQuestionsPrompt?: string | null;
  showCanaryStatement: boolean;
  securityTxt?: string | null;
};

export const ServerSettingsFormFragmentDoc = gql`
  fragment ServerSettingsForm on ServerConfig {
    id
    serverQuestionsPrompt
    showCanaryStatement
    securityTxt
  }
`;
