import { gql } from "@apollo/client";

export const LIKES_BY_POST_ID = gql`
  query($postId: ID!) {
    likesByPostId(postId: $postId) {
      id
      userId
      postId
    }
  }
`;

export const LIKES_BY_COMMENT_ID = gql`
  query($commentId: ID!) {
    likesByCommentId(commentId: $commentId) {
      id
      userId
      commentId
    }
  }
`;
