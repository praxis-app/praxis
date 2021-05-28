import { gql } from "@apollo/client";

export const FEED_MOTION = gql`
  fragment FeedMotion on Motion {
    id
    userId
    motionGroupId: groupId
    body
    action
    actionData
    stage
    createdAt
  }
`;

export const MOTION_SUMMARY = gql`
  fragment MotionSummary on Motion {
    id
    userId
    groupId
    body
    action
    actionData
    stage
    createdAt
  }
`;
