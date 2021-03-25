import { gql } from "@apollo/client";

export const SIGN_UP = gql`
  mutation SignUpMutation(
    $name: String!
    $email: String!
    $password: String!
    $passwordConfirm: String!
  ) {
    signUp(
      input: {
        name: $name
        email: $email
        password: $password
        passwordConfirm: $passwordConfirm
      }
    ) {
      user {
        id
        name
        email
      }
      token
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignInMutation($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      user {
        id
        name
        email
      }
      token
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUserMutation($id: ID!, $name: String!, $email: String!) {
    updateUser(id: $id, input: { name: $name, email: $email }) {
      user {
        id
        name
        email
      }
      token
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUserMutation($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const CREATE_POST = gql`
  mutation CreatePostMutation(
    $body: String!
    $images: [FileUpload]
    $userId: ID!
  ) {
    createPost(userId: $userId, input: { body: $body, images: $images }) {
      post {
        id
        body
        userId
        createdAt
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePostMutation($id: ID!, $body: String!, $images: [FileUpload]) {
    updatePost(id: $id, input: { body: $body, images: $images }) {
      post {
        id
        body
        userId
        createdAt
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePostMutation($id: ID!) {
    deletePost(id: $id)
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImageMutation($image: FileUpload!, $userId: ID!) {
    uploadImage(image: $image, userId: $userId) {
      image {
        id
        path
      }
    }
  }
`;

export const DELETE_IMAGE = gql`
  mutation DeleteImageMutation($id: ID!) {
    deleteImage(id: $id)
  }
`;

export const CREATE_FOLLOW = gql`
  mutation CreateFollowMutation($userId: ID!, $followerId: ID!) {
    createFollow(userId: $userId, followerId: $followerId) {
      follow {
        id
        userId
        followerId
        createdAt
      }
    }
  }
`;

export const DELETE_FOLLOW = gql`
  mutation DeleteFollowMutation($id: ID!) {
    deleteFollow(id: $id)
  }
`;

export const SET_CURRENT_USER = gql`
  mutation SetCurrentUserMutation(
    $id: String!
    $name: String!
    $email: String!
  ) {
    setCurrentUser(user: { id: $id, name: $name, email: $email }) @client
  }
`;

export const LOGOUT_USER = gql`
  mutation LogoutUserMutation {
    logoutUser @client
  }
`;
