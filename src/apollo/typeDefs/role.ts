export default `

type Role {
  id: ID!
  groupId: ID
  name: String!
  color: String
  global: Boolean
  createdAt: String!
  updatedAt: String!
}

input CreateRoleInput {
  name: String!
  color: String
}

input UpdateRoleInput {
  name: String!
  color: String
}

type RolePayload {
  role: Role!
}

`;
