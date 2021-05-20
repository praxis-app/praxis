export default `

type Setting {
  id: ID!
  userId: ID
  groupId: ID
  name: String!
  value: String!
  createdAt: String!
  updatedAt: String!
}

input SettingInput {
  id: ID!
  userId: ID
  groupId: ID
  value: String!
}

input UpdateSettingsInput {
  settings: [SettingInput]!
}

type SettingsPayload {
  settings: [Setting]!
}

`;
