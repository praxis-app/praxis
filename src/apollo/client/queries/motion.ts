import gql from "graphql-tag";

export const MOTION = gql`
  query ($id: ID!) {
    motion(id: $id) {
      id
      userId
      groupId
      body
      action
      actionData
      stage
      createdAt
    }
  }
`;

export const MOTIONS_BY_USER_NAME = gql`
  query ($name: String!) {
    motionsByUserName(name: $name) {
      id
      userId
      groupId
      body
      action
      actionData
      stage
      createdAt
    }
  }
`;

export const MOTIONS_BY_GROUP_NAME = gql`
  query ($name: String!) {
    motionsByGroupName(name: $name) {
      id
      userId
      groupId
      body
      action
      actionData
      stage
      createdAt
    }
  }
`;
