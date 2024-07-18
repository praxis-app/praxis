import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ServerSettingsFormFragment = {
  __typename?: 'ServerConfig';
  id: number;
  about?: string | null;
  decisionMakingModel: Types.DecisionMakingModel;
  ratificationThreshold: number;
  reservationsLimit: number;
  securityTxt?: string | null;
  serverQuestionsPrompt?: string | null;
  showCanaryStatement: boolean;
  standAsidesLimit: number;
  votingTimeLimit: number;
};

export const ServerSettingsFormFragmentDoc = gql`
  fragment ServerSettingsForm on ServerConfig {
    id
    about
    decisionMakingModel
    ratificationThreshold
    reservationsLimit
    securityTxt
    serverQuestionsPrompt
    showCanaryStatement
    standAsidesLimit
    votingTimeLimit
  }
`;
