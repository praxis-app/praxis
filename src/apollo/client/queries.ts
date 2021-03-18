import gql from "graphql-tag";

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

export const POST = gql`
  query($id: ID!) {
    post(id: $id) {
      id
      userId
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
      body
      createdAt
    }
  }
`;

export const IMAGES = gql`
  {
    allImages {
      id
      userId
      postId
      path
    }
  }
`;

export const IMAGES_BY_POST_ID = gql`
  query($postId: ID!) {
    imagesByPostId(postId: $postId) {
      id
      userId
      postId
      path
    }
  }
`;

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
