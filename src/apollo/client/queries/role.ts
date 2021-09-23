import gql from "graphql-tag";
import { ROLE_SUMMARY } from "../fragments";

export const ROLE = gql`
  query ($id: ID!) {
    role(id: $id) {
      ...RoleSummary
    }
  }
  ${ROLE_SUMMARY}
`;

export const ROLES_BY_GROUP_ID = gql`
  query ($groupId: ID!) {
    rolesByGroupId(groupId: $groupId) {
      ...RoleSummary
    }
  }
  ${ROLE_SUMMARY}
`;

export const GLOBAL_ROLES = gql`
  {
    globalRoles {
      id
      name
      color
      createdAt
    }
  }
`;

export const PERMISSIONS_BY_ROLE_ID = gql`
  query ($roleId: ID!) {
    permissionsByRoleId(roleId: $roleId) {
      id
      roleId
      name
      enabled
      createdAt
    }
  }
`;

export const HAS_PERMISSION_GLOBALLY = gql`
  query ($name: String!, $userId: ID!) {
    hasPermissionGlobally(name: $name, userId: $userId)
  }
`;

export const HAS_PERMISSION_BY_GROUP_ID = gql`
  query ($name: String!, $userId: ID!, $groupId: ID!) {
    hasPermissionByGroupId(name: $name, userId: $userId, groupId: $groupId)
  }
`;

export const ROLE_MEMBERS = gql`
  query ($roleId: ID!) {
    roleMembers(roleId: $roleId) {
      id
      roleId
      userId
      createdAt
    }
  }
`;
