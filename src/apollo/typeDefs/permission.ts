export default `

type Permission {
  id: ID!
  roleId: ID!
  name: String!
  enabled: Boolean!
  createdAt: String!
  updatedAt: String!
}

input PermissionInput {
  id: ID!
  enabled: Boolean!
}

input ProposedPermissionInput {
  name: String!
  enabled: Boolean!
}

input UpdatePermissionsInput {
  permissions: [PermissionInput]!
}

type PermissionsPayload {
  permissions: [Permission]!
}

`;
