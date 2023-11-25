import * as Types from '../../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionGroupSettingsFragment = {
  __typename?: 'ProposalActionGroupConfig';
  id: number;
  privacy?: string | null;
};

export const ProposalActionGroupSettingsFragmentDoc = gql`
  fragment ProposalActionGroupSettings on ProposalActionGroupConfig {
    id
    privacy
  }
`;
