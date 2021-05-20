import gql from "graphql-tag";

export const POST = gql`
  query ($id: ID!) {
    post(id: $id) {
      id
      userId
      groupId
      body
      createdAt
    }
  }
`;

export const POSTS = gql`
  {
    allPosts {
      id
      userId
      groupId
      body
      createdAt
    }
  }
`;

export const POSTS_BY_USER_NAME = gql`
  query ($name: String!) {
    postsByUserName(name: $name) {
      id
      userId
      groupId
      body
      createdAt
    }
  }
`;

export const POSTS_BY_GROUP_NAME = gql`
  query ($name: String!) {
    postsByGroupName(name: $name) {
      id
      userId
      groupId
      body
      createdAt
    }
  }
`;
