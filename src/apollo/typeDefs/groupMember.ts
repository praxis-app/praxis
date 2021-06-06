export default `

type GroupMember {
  id: ID!
  userId: ID!
  groupId: ID!
  createdAt: String!
  updatedAt: String!
}

type MemberRequest {
  id: ID!
  userId: ID!
  groupId: ID!
  status: String!
  createdAt: String!
  updatedAt: String!
}

type GroupMemberPayload {
  groupMember: GroupMember!
}

type MemberRequestPayload {
  memberRequest: MemberRequest!
}

`;
