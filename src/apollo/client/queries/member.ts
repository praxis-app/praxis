import { gql } from "@apollo/client";

export const GROUP_MEMBERS = gql`
  query ($groupId: ID!) {
    groupMembers(groupId: $groupId) {
      id
      userId
      groupId
      createdAt
    }
  }
`;

export const MEMBER_REUQESTS = gql`
  query ($groupId: ID!) {
    memberRequests(groupId: $groupId) {
      id
      userId
      groupId
      status
      createdAt
    }
  }
`;
