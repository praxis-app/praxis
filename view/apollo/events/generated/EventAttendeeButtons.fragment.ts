import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EventAttendeeButtonsFragment = {
  __typename?: 'Event';
  id: number;
  attendingStatus?: string | null;
  group?: { __typename?: 'Group'; id: number; isJoinedByMe?: boolean } | null;
};

export const EventAttendeeButtonsFragmentDoc = gql`
  fragment EventAttendeeButtons on Event {
    id
    attendingStatus
    group {
      id
      isJoinedByMe @include(if: $isLoggedIn)
    }
  }
`;
