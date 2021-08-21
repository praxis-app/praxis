import gql from "graphql-tag";

export const COMMENT = gql`
  query ($id: ID!) {
    comment(id: $id) {
      id
      userId
      postId
      motionId
      body
      createdAt
    }
  }
`;

export const COMMENTS_BY_POST_ID = gql`
  query ($postId: ID!) {
    commentsByPostId(postId: $postId) {
      comments {
        id
        userId
        postId
        body
        createdAt
        updatedAt
      }
      totalComments
    }
  }
`;

export const COMMENTS_BY_MOTION_ID = gql`
  query ($motionId: ID!) {
    commentsByMotionId(motionId: $motionId) {
      comments {
        id
        userId
        motionId
        body
        createdAt
        updatedAt
      }
      totalComments
    }
  }
`;

export const TOTAL_COMMENTS_BY_POST_ID = gql`
  query ($postId: ID!) {
    commentsByPostId(postId: $postId) {
      totalComments
    }
  }
`;

export const TOTAL_COMMENTS_BY_MOTION_ID = gql`
  query ($motionId: ID!) {
    commentsByMotionId(motionId: $motionId) {
      totalComments
    }
  }
`;
