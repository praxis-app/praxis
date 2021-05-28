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
  query ($name: String!) {
    groupFeed(name: $name) {
      ... on Post {
        ...FeedPost
      }
      ... on Motion {
        ...FeedMotion
      }
    }
  }
  ${FEED_POST}
  ${FEED_MOTION}
`;
