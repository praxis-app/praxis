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

export const IMAGES_BY_MOTION_ID = gql`
  query($motionId: ID!) {
    imagesByMotionId(motionId: $motionId) {
      id
      userId
      motionId
      path
    }
  }
`;

export const IMAGES_BY_COMMENT_ID = gql`
  query($commentId: ID!) {
    imagesByCommentId(commentId: $commentId) {
      id
      userId
      commentId
      path
    }
  }
`;

export const CURRENT_PROFILE_PICTURE = gql`
  query($userId: ID!) {
    currentProfilePicture(userId: $userId) {
      id
      userId
      path
    }
  }
`;

export const PROFILE_PICTURES = gql`
  query($userId: ID!) {
    profilePictures(userId: $userId) {
      id
      userId
      path
    }
  }
`;

export const CURRENT_COVER_PHOTO = gql`
  query($groupId: ID!) {
    currentCoverPhoto(groupId: $groupId) {
      id
      groupId
      path
    }
  }
`;
