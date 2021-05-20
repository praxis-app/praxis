import gql from "graphql-tag";

export const SETTINGS_BY_USER_ID = gql`
  query($userId: ID!) {
    settingsByUserId(userId: $userId) {
      id
      userId
      name
      value
      createdAt
    }
  }
`;

export const SETTINGS_BY_GROUP_ID = gql`
  query($groupId: ID!) {
    settingsByGroupId(groupId: $groupId) {
      id
      groupId
      name
      value
      createdAt
    }
  }
`;
