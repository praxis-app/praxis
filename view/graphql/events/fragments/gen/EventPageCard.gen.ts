import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { EventAttendeeButtonsFragmentDoc } from './EventAttendeeButtons.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EventPageCardFragment = {
  __typename?: 'Event';
  id: number;
  name: string;
  description: string;
  location?: string | null;
  online: boolean;
  externalLink?: string | null;
  interestedCount: number;
  goingCount: number;
  startsAt: any;
  endsAt?: any | null;
  attendingStatus?: string | null;
  host?: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
  } | null;
  coverPhoto: { __typename?: 'Image'; id: number };
  group?: {
    __typename?: 'Group';
    id: number;
    name: string;
    isJoinedByMe?: boolean;
    myPermissions?: { __typename?: 'GroupPermissions'; manageEvents: boolean };
  } | null;
};

export const EventPageCardFragmentDoc = gql`
  fragment EventPageCard on Event {
    id
    name
    description
    location
    online
    externalLink
    interestedCount
    goingCount
    startsAt
    endsAt
    ...EventAttendeeButtons @include(if: $isVerified)
    host {
      id
      name
      displayName
    }
    coverPhoto {
      id
    }
    group {
      id
      name
      myPermissions @include(if: $isVerified) {
        manageEvents
      }
    }
  }
  ${EventAttendeeButtonsFragmentDoc}
`;
