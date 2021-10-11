import gql from "graphql-tag";

export const IMAGES_BY_POST_ID = gql`
  query ($postId: ID!) {
    imagesByPostId(postId: $postId) {
      id
      userId
      postId
      path
    }
  }
`;

export const IMAGES_BY_MOTION_ID = gql`
  query ($motionId: ID!) {
    imagesByMotionId(motionId: $motionId) {
      id
      userId
      motionId
      path
    }
  }
`;

export const IMAGES_BY_COMMENT_ID = gql`
  query ($commentId: ID!) {
    imagesByCommentId(commentId: $commentId) {
      id
      userId
      commentId
      path
    }
  }
`;

export const PROFILE_PICTURE = gql`
  query ($userId: ID!) {
    profilePicture(userId: $userId) {
      id
      userId
      path
    }
  }
`;

export const PROFILE_PICTURES = gql`
  query ($userId: ID!) {
    profilePictures(userId: $userId) {
      id
      userId
      path
    }
  }
`;

export const COVER_PHOTO_BY_USER_ID = gql`
  query ($userId: ID!) {
    coverPhotoByUserId(userId: $userId) {
      id
      userId
      path
    }
  }
`;

export const COVER_PHOTO_BY_GROUP_ID = gql`
  query ($groupId: ID!) {
    coverPhotoByGroupId(groupId: $groupId) {
      id
      groupId
      path
    }
  }
`;
