import { gql } from "@apollo/client";

export const CREATE_COMMENT = gql`
  mutation CreateCommentMutation(
    $userId: ID!
    $postId: ID!
    $body: String
    $images: [FileUpload]
  ) {
    createComment(
      userId: $userId
      postId: $postId
      input: { body: $body, images: $images }
    ) {
      comment {
        id
        body
        userId
        postId
        createdAt
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateCommentMutation(
    $id: ID!
    $body: String!
    $images: [FileUpload]
  ) {
    updateComment(id: $id, input: { body: $body, images: $images }) {
      comment {
        id
        body
        userId
        postId
        createdAt
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteCommentMutation($id: ID!) {
    deleteComment(id: $id)
  }
`;
