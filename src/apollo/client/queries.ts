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

export const FOLLOWERS = gql`
  query($userId: ID!) {
    userFollowers(userId: $userId) {
      id
      userId
      followerId
      createdAt
    }
  }
`;

export const FOLLOWING = gql`
  query($userId: ID!) {
    userFollowing(userId: $userId) {
      id
      userId
      followerId
      createdAt
    }
  }
`;

export const FOLLOWERS_BY_NAME = gql`
  query($name: String!) {
    userFollowersByName(name: $name) {
      id
      userId
      followerId
      createdAt
    }
  }
`;

export const FOLLOWING_BY_NAME = gql`
  query($name: String!) {
    userFollowingByName(name: $name) {
      id
      userId
      followerId
      createdAt
    }
  }
`;
