import gql from "graphql-tag";
import { MOTION_SUMMARY } from "../fragments";

export const MOTION = gql`
  query ($id: ID!) {
    motion(id: $id) {
      ...MotionSummary
    }
  }
  ${MOTION_SUMMARY}
`;

export const MOTIONS_BY_USER_NAME = gql`
  query ($name: String!) {
    motionsByUserName(name: $name) {
      ...MotionSummary
    }
  }
  ${MOTION_SUMMARY}
`;

export const MOTIONS_BY_GROUP_NAME = gql`
  query ($name: String!) {
    motionsByGroupName(name: $name) {
      ...MotionSummary
    }
  }
  ${MOTION_SUMMARY}
`;
