import { gql } from "@apollo/client";

export const EVENT_SUMMARY = gql`
  fragment EventSummary on Event {
    id
    groupId
    name
    description
    location
    startsAt
    endsAt
    online
    externalLink
    createdAt
  }
`;

export const EVENT_ATTENDEE_SUMMARY = gql`
  fragment EventAttendeeSummary on EventAttendee {
    id
    userId
    eventId
    status
    createdAt
  }
`;
