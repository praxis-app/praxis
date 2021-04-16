import gql from "graphql-tag";

export const GROUP = gql`
  query($id: ID!) {
    group(id: $id) {
      id
      name
      description
      creatorId
      createdAt
    }
  }
`;

export const GROUPS = gql`
  {
    allGroups {
      id
      name
      description
      creatorId
      createdAt
    }
  }
`;

export const GROUP_BY_NAME = gql`
  query($name: String!) {
    groupByName(name: $name) {
      id
      name
      description
      creatorId
      createdAt
    }
  }
`;

export const GROUP_FEED = gql`
  query($name: String!) {
    groupFeed(name: $name) {
      ... on Post {
        id
        userId
        postGroupId: groupId
        body
        createdAt
      }
      ... on Motion {
        id
        userId
        motionGroupId: groupId
        body
        action
        createdAt
      }
    }
  }
`;
