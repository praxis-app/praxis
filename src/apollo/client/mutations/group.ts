import { gql } from "@apollo/client";

export const CREATE_GROUP = gql`
  mutation CreateGroupMutation(
    $name: String!
    $description: String
    $coverPhoto: FileUpload
    $creatorId: ID!
  ) {
    createGroup(
      creatorId: $creatorId
      input: { name: $name, description: $description, coverPhoto: $coverPhoto }
    ) {
      group {
        id
        name
        description
        creatorId
        createdAt
      }
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroupMutation(
    $id: ID!
    $name: String!
    $description: String
    $coverPhoto: FileUpload
  ) {
    updateGroup(
      id: $id
      input: { name: $name, description: $description, coverPhoto: $coverPhoto }
    ) {
      group {
        id
        name
        description
        creatorId
        createdAt
      }
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroupMutation($id: ID!) {
    deleteGroup(id: $id)
  }
`;
