import gql from "graphql-tag";
import { FEED_MOTION, FEED_POST, USER_SUMMARY } from "../fragments";

export const CURRENT_USER = gql`
  {
    user @client {
      id
      name
      email
      isAuthenticated
    }
  }
`;

export const USER = gql`
  query ($id: ID!) {
    user(id: $id) {
      ...UserSummary
    }
  }
  ${USER_SUMMARY}
`;

export const USER_BY_NAME = gql`
  query ($name: String!) {
    userByName(name: $name) {
      ...UserSummary
    }
  }
  ${USER_SUMMARY}
`;

export const USERS = gql`
  {
    allUsers {
      ...UserSummary
    }
  }
  ${USER_SUMMARY}
`;

export const HOME_FEED = gql`
  query ($userId: ID) {
    homeFeed(userId: $userId) {
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

export const PROFILE_FEED = gql`
  query ($name: String!) {
    profileFeed(name: $name) {
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
