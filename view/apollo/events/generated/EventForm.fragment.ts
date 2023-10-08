import * as Types from '../../gen';

import { gql } from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type EventFormFragment = {
  __typename?: 'Event';
  id: number;
  name: string;
  startsAt: any;
  endsAt?: any | null;
  description: string;
  location?: string | null;
  online: boolean;
  externalLink?: string | null;
  host: { __typename?: 'User'; id: number };
};

export const EventFormFragmentDoc = gql`
  fragment EventForm on Event {
    id
    name
    startsAt
    endsAt
    description
    location
    online
    externalLink
    host {
      id
    }
  }
`;
