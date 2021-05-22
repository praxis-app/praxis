import gql from "graphql-tag";
import { POST_SUMMARY } from "../fragments";

export const POST = gql`
  query ($id: ID!) {
    post(id: $id) {
      ...PostSummary
    }
  }
  ${POST_SUMMARY}
`;

export const POSTS_BY_USER_NAME = gql`
  query ($name: String!) {
    postsByUserName(name: $name) {
      ...PostSummary
    }
  }
  ${POST_SUMMARY}
`;

export const POSTS_BY_GROUP_NAME = gql`
  query ($name: String!) {
    postsByGroupName(name: $name) {
      ...PostSummary
    }
  }
  ${POST_SUMMARY}
`;
