import { gql } from "@apollo/client";

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

export const SIGN_UP = gql`
  mutation SignUpMutation(
    $name: String!
    $email: String!
    $password: String!
    $passwordConfirm: String!
    $profilePicture: FileUpload
  ) {
    signUp(
      input: {
        name: $name
        email: $email
        password: $password
        passwordConfirm: $passwordConfirm
        profilePicture: $profilePicture
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
  mutation UpdateUserMutation(
    $id: ID!
    $name: String!
    $email: String!
    $bio: String!
    $profilePicture: FileUpload
    $coverPhoto: FileUpload
  ) {
    updateUser(
      id: $id
      input: {
        name: $name
        email: $email
        bio: $bio
        profilePicture: $profilePicture
        coverPhoto: $coverPhoto
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

export const DELETE_USER = gql`
  mutation DeleteUserMutation($id: ID!) {
    deleteUser(id: $id)
  }
`;
