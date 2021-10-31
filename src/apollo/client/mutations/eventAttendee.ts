import { gql } from "@apollo/client";
import { EVENT_ATTENDEE_SUMMARY } from "../fragments";

export const CREATE_EVENT_ATTENDEE = gql`
  mutation CreateEventAttendeeMutation(
    $eventId: ID!
    $userId: ID!
    $status: String!
  ) {
    createEventAttendee(
      eventId: $eventId
      userId: $userId
      input: { status: $status }
    ) {
      eventAttendee {
        ...EventAttendeeSummary
      }
    }
  }
  ${EVENT_ATTENDEE_SUMMARY}
`;

export const DELETE_EVENT_ATTENDEE = gql`
  mutation DeleteEventAttendeeMutation($id: ID!) {
    deleteEventAttendee(id: $id)
  }
`;
