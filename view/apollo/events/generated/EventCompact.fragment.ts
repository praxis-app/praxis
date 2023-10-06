import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventAttendeeButtonsFragmentDoc } from './EventAttendeeButtons.fragment';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EventCompactFragment = {
  __typename?: 'Event';
  id: number;
  name: string;
  description: string;
  startsAt: any;
  interestedCount: number;
  goingCount: number;
  online: boolean;
  location?: string | null;
  attendingStatus?: string | null;
  coverPhoto: { __typename?: 'Image'; id: number };
  group?: {
    __typename?: 'Group';
    id: number;
    isJoinedByMe?: boolean;
    myPermissions?: { __typename?: 'GroupPermissions'; manageEvents: boolean };
  } | null;
};

export const EventCompactFragmentDoc = gql`
  fragment EventCompact on Event {
    id
    name
    description
    startsAt
    interestedCount
    goingCount
    online
    location
    ...EventAttendeeButtons @include(if: $isLoggedIn)
    coverPhoto {
      id
    }
    group {
      id
      myPermissions @include(if: $isLoggedIn) {
        manageEvents
      }
    }
  }
  ${EventAttendeeButtonsFragmentDoc}
`;
