import gql from "graphql-tag";

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
  query($id: ID!) {
    user(id: $id) {
      id
      name
      email
      createdAt
    }
  }
`;

export const USER_BY_NAME = gql`
  query($name: String!) {
    userByName(name: $name) {
      id
      name
      email
      createdAt
    }
  }
`;

export const USERS = gql`
  {
    allUsers {
      id
      name
      email
      createdAt
    }
  }
`;

export const HOME_FEED = gql`
  query($userId: ID) {
    homeFeed(userId: $userId) {
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
        actionData
        stage
        createdAt
      }
    }
  }
`;
