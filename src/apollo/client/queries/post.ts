import gql from "graphql-tag";

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

export const POSTS_BY_NAME = gql`
  query($name: String!) {
    postsByName(name: $name) {
      id
      userId
      body
      createdAt
    }
  }
`;
