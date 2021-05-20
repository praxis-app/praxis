import { gql } from "@apollo/client";

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettingsMutation($settings: [SettingInput]!) {
    updateSettings(input: { settings: $settings }) {
      settings {
        id
        userId
        groupId
        name
        value
        createdAt
      }
    }
  }
`;
