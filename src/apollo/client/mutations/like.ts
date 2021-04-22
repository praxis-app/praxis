import { gql } from "@apollo/client";

export const CREATE_LIKE = gql`
  mutation CreateLikeMutation(
    $userId: ID!
    $postId: ID
    $motionId: ID
    $commentId: ID
  ) {
    createLike(
      userId: $userId
      postId: $postId
      motionId: $motionId
      commentId: $commentId
    ) {
      like {
        id
        userId
        postId
        commentId
      }
    }
  }
`;

export const DELETE_LIKE = gql`
  mutation DeleteLikeMutation($id: ID!) {
    deleteLike(id: $id)
  }
`;
