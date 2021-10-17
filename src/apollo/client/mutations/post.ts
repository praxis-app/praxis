import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation CreatePostMutation(
    $body: String!
    $images: [FileUpload]
    $userId: ID!
    $groupId: ID
    $eventId: ID
  ) {
    createPost(
      userId: $userId
      groupId: $groupId
      eventId: $eventId
      input: { body: $body, images: $images }
    ) {
      post {
        id
        body
        userId
        groupId
        eventId
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
