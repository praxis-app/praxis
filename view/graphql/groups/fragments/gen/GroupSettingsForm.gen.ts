import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type GroupSettingsFormFragment = {
  __typename?: 'Group';
  id: number;
  settings: {
    __typename?: 'GroupConfig';
    id: number;
    adminModel: string;
    decisionMakingModel: Types.DecisionMakingModel;
    ratificationThreshold: number;
    reservationsLimit: number;
    standAsidesLimit: number;
    votingTimeLimit: number;
    isPublic: boolean;
    privacy: string;
  };
};

export const GroupSettingsFormFragmentDoc = gql`
  fragment GroupSettingsForm on Group {
    id
    settings {
      id
      adminModel
      decisionMakingModel
      ratificationThreshold
      reservationsLimit
      standAsidesLimit
      votingTimeLimit
      isPublic
      privacy
    }
  }
`;
