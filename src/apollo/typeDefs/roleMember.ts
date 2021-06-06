export default `

type RoleMember {
  id: ID!
  roleId: ID!
  userId: ID!
  createdAt: String!
  updatedAt: String!
}

input SelectedUsersInput {
  userId: ID!
}

input AddRoleMembersInput {
  selectedUsers: [SelectedUsersInput]!
}

type RoleMemberPayload {
  roleMembers: [RoleMember]!
}

`;
