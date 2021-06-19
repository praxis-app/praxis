import { gql } from "@apollo/client";

export const CREATE_MEMBER_REQUEST = gql`
  mutation CreateMemberRequestMutation($groupId: ID!, $userId: ID!) {
    createMemberRequest(groupId: $groupId, userId: $userId) {
      memberRequest {
        id
        userId
        groupId
        status
        createdAt
      }
    }
  }
`;

export const DELETE_MEMBER_REQUEST = gql`
  mutation DeleteMemberRequestMutation($id: ID!) {
    deleteMemberRequest(id: $id)
  }
`;

export const DELETE_GROUP_MEMBER = gql`
  mutation DeleteGroupMemberMutation($id: ID!) {
    deleteGroupMember(id: $id)
  }
`;

export const APPROVE_MEMBER_REQUEST = gql`
  mutation ApproveMemberRequestMutation($id: ID!) {
    approveMemberRequest(id: $id) {
      groupMember {
        id
        userId
        groupId
        createdAt
      }
    }
  }
`;

export const DENY_MEMBER_REQUEST = gql`
  mutation DenyMemberRequestMutation($id: ID!) {
    denyMemberRequest(id: $id) {
      memberRequest {
        id
        userId
        groupId
        status
        createdAt
      }
    }
  }
`;
