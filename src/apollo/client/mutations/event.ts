import { gql } from "@apollo/client";
import { EVENT_SUMMARY } from "../fragments";

export const CREATE_EVENT = gql`
  mutation CreateEventMutation(
    $userId: ID!
    $groupId: ID
    $name: String!
    $description: String!
    $location: String
    $startsAt: String!
    $endsAt: String
    $online: Boolean!
    $externalLink: String
    $coverPhoto: FileUpload
  ) {
    createEvent(
      userId: $userId
      groupId: $groupId
      input: {
        name: $name
        description: $description
        location: $location
        startsAt: $startsAt
        endsAt: $endsAt
        online: $online
        externalLink: $externalLink
        coverPhoto: $coverPhoto
      }
    ) {
      event {
        ...EventSummary
      }
    }
  }
  ${EVENT_SUMMARY}
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEventMutation(
    $id: ID!
    $name: String!
    $description: String!
    $location: String
    $startsAt: String!
    $endsAt: String
    $online: Boolean!
    $externalLink: String
    $coverPhoto: FileUpload
  ) {
    updateEvent(
      id: $id
      input: {
        name: $name
        description: $description
        location: $location
        startsAt: $startsAt
        endsAt: $endsAt
        online: $online
        externalLink: $externalLink
        coverPhoto: $coverPhoto
      }
    ) {
      event {
        ...EventSummary
      }
    }
  }
  ${EVENT_SUMMARY}
`;

export const DELETE_EVENT = gql`
  mutation DeleteEventMutation($id: ID!) {
    deleteEvent(id: $id)
  }
`;
