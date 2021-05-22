import { gql } from "@apollo/client";
import { GROUP_SUMMARY } from "../fragments";

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
        ...GroupSummary
      }
    }
  }
  ${GROUP_SUMMARY}
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
        ...GroupSummary
      }
    }
  }
  ${GROUP_SUMMARY}
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroupMutation($id: ID!) {
    deleteGroup(id: $id)
  }
`;
