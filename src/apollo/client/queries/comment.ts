import gql from "graphql-tag";

export const COMMENT = gql`
  query($id: ID!) {
    comment(id: $id) {
      id
      userId
      postId
      body
      createdAt
    }
  }
`;

export const COMMENTS_BY_POST_ID = gql`
  query($postId: ID!) {
    commentsByPostId(postId: $postId) {
      id
      userId
      postId
      body
      createdAt
      updatedAt
    }
  }
`;
