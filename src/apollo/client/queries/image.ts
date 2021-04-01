import gql from "graphql-tag";

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

export const IMAGES_BY_COMMENT_ID = gql`
  query($commentId: ID!) {
    imagesByCommentId(commentId: $commentId) {
      id
      userId
      postId
      path
    }
  }
`;
