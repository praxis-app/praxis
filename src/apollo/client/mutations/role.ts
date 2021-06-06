import { gql } from "@apollo/client";
import { ROLE_SUMMARY } from "../fragments";

export const CREATE_ROLE = gql`
  mutation CreateRoleMutation(
    $groupId: ID
    $name: String!
    $color: String
    $global: Boolean
  ) {
    createRole(
      groupId: $groupId
      global: $global
      input: { name: $name, color: $color }
    ) {
      role {
        ...RoleSummary
      }
    }
  }
  ${ROLE_SUMMARY}
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRoleMutation($id: ID!, $name: String!, $color: String!) {
    updateRole(id: $id, input: { name: $name, color: $color }) {
      role {
        ...RoleSummary
      }
    }
  }
  ${ROLE_SUMMARY}
`;

export const DELETE_ROLE = gql`
  mutation DeleteRoleMutation($id: ID!) {
    deleteRole(id: $id)
  }
`;

export const INITIALIZE_ADMIN_ROLE = gql`
  mutation InitializeAdminRoleMutation($userId: ID!) {
    initializeAdminRole(userId: $userId) {
      role {
        ...RoleSummary
      }
    }
  }
  ${ROLE_SUMMARY}
`;

export const UPDATE_PERMISSIONS = gql`
  mutation UpdatePermissionsMutation($permissions: [PermissionInput]!) {
    updatePermissions(input: { permissions: $permissions }) {
      permissions {
        id
        roleId
        name
        description
        enabled
        createdAt
      }
    }
  }
`;
