import gql from "graphql-tag";
import {
  EVENT_ATTENDEE_SUMMARY,
  EVENT_SUMMARY,
  POST_SUMMARY,
} from "../fragments";

export const EVENT_FEED = gql`
  query ($eventId: ID!, $currentPage: Int!, $pageSize: Int!) {
    eventFeed(
      eventId: $eventId
      currentPage: $currentPage
      pageSize: $pageSize
    ) {
      pagedItems {
        ...PostSummary
      }
      totalItems
    }
  }
  ${POST_SUMMARY}
`;

export const EVENT = gql`
  query ($id: ID!) {
    event(id: $id) {
      ...EventSummary
    }
  }
  ${EVENT_SUMMARY}
`;

export const EVENTS = gql`
  {
    allEvents {
      ...EventSummary
    }
  }
  ${EVENT_SUMMARY}
`;

export const EVENTS_BY_GROUP_ID = gql`
  query ($groupId: ID!, $timeFrame: String) {
    eventsByGroupId(groupId: $groupId, timeFrame: $timeFrame) {
      ...EventSummary
    }
  }
  ${EVENT_SUMMARY}
`;

export const JOINED_GROUP_EVENTS_BY_USER_ID = gql`
  query ($userId: ID!, $timeFrame: String, $online: Boolean) {
    joinedGroupEventsByUserId(
      userId: $userId
      timeFrame: $timeFrame
      online: $online
    ) {
      ...EventSummary
    }
  }
  ${EVENT_SUMMARY}
`;

export const EVENT_ATTENDEES = gql`
  query ($eventId: ID!) {
    eventAttendees(eventId: $eventId) {
      ...EventAttendeeSummary
    }
  }
  ${EVENT_ATTENDEE_SUMMARY}
`;
