import gql from "graphql-tag";

export const FOLLOWERS = gql`
  query ($userId: ID!) {
    userFollowers(userId: $userId) {
      id
      userId
      followerId
      createdAt
    }
  }
`;

export const FOLLOWING = gql`
  query ($userId: ID!) {
    userFollowing(userId: $userId) {
      id
      userId
      followerId
      createdAt
    }
  }
`;

export const FOLLOWERS_BY_NAME = gql`
  query ($name: String!) {
    userFollowersByName(name: $name) {
      id
      userId
      followerId
      createdAt
    }
  }
`;

export const FOLLOWING_BY_NAME = gql`
  query ($name: String!) {
    userFollowingByName(name: $name) {
      id
      userId
      followerId
      createdAt
    }
  }
`;
