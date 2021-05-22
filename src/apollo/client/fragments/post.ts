import { gql } from "@apollo/client";

export const FEED_POST = gql`
  fragment FeedPost on Post {
    id
    userId
    postGroupId: groupId
    body
    createdAt
  }
`;

export const POST_SUMMARY = gql`
  fragment PostSummary on Post {
    id
    userId
    groupId
    body
    createdAt
  }
`;
