import { gql } from "@apollo/client";

export const CREATE_MOTION = gql`
  mutation CreateMotionMutation(
    $body: String!
    $action: String
    $actionData: ActionDataInput
    $images: [FileUpload]
    $userId: ID!
    $groupId: ID!
  ) {
    createMotion(
      userId: $userId
      groupId: $groupId
      input: {
        body: $body
        action: $action
        actionData: $actionData
        images: $images
      }
    ) {
      motion {
        id
        body
        action
        actionData
        stage
        userId
        groupId
        createdAt
      }
    }
  }
`;

export const UPDATE_MOTION = gql`
  mutation UpdateMotionMutation(
    $id: ID!
    $body: String
    $action: String
    $actionData: ActionDataInput
    $images: [FileUpload]
  ) {
    updateMotion(
      id: $id
      input: {
        body: $body
        action: $action
        actionData: $actionData
        images: $images
      }
    ) {
      motion {
        id
        body
        action
        actionData
        stage
        userId
        createdAt
      }
    }
  }
`;

export const DELETE_MOTION = gql`
  mutation DeleteMotionMutation($id: ID!) {
    deleteMotion(id: $id)
  }
`;
