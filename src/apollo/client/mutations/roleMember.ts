import { gql } from "@apollo/client";

export const ADD_ROLE_MEMBERS = gql`
  mutation AddRoleMembersMutation(
    $roleId: ID!
    $selectedUsers: [SelectedUsersInput]!
  ) {
    addRoleMembers(roleId: $roleId, input: { selectedUsers: $selectedUsers }) {
      roleMembers {
        id
        roleId
        userId
        createdAt
      }
    }
  }
`;

export const DELETE_ROLE_MEMBER = gql`
  mutation DeleteRoleMemberMutation($id: ID!) {
    deleteRoleMember(id: $id)
  }
`;
