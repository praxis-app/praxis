import gql from "graphql-tag";
import { FEED_MOTION, FEED_POST, GROUP_SUMMARY } from "../fragments";

export const GROUP = gql`
  query ($id: ID!) {
    group(id: $id) {
      ...GroupSummary
    }
  }
  ${GROUP_SUMMARY}
`;

export const GROUPS = gql`
  {
    allGroups {
      ...GroupSummary
    }
  }
  ${GROUP_SUMMARY}
`;

export const GROUP_BY_NAME = gql`
  query ($name: String!) {
    groupByName(name: $name) {
      ...GroupSummary
    }
  }
  ${GROUP_SUMMARY}
`;

export const GROUP_FEED = gql`
  query ($name: String!, $currentPage: Int!, $pageSize: Int!) {
    groupFeed(name: $name, currentPage: $currentPage, pageSize: $pageSize) {
      pagedItems {
        ... on Post {
          ...FeedPost
        }
        ... on Motion {
          ...FeedMotion
        }
      }
      totalItems
    }
  }
  ${FEED_POST}
  ${FEED_MOTION}
`;

export const GROUP_MEMBERS = gql`
  query ($groupId: ID!) {
    groupMembers(groupId: $groupId) {
      id
      userId
      groupId
      createdAt
    }
  }
`;

export const MEMBER_REUQESTS = gql`
  query ($groupId: ID!) {
    memberRequests(groupId: $groupId) {
      id
      userId
      groupId
      status
      createdAt
    }
  }
`;
