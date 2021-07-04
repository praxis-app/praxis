export default `

type ServerInvite {
  id: ID!
  userId: ID!
  token: String!
  uses: Int!
  maxUses: Int
  expiresAt: String
  createdAt: String!
  updatedAt: String!
}

input CreateServerInviteInput {
  maxUses: Int
  expiresAt: String
}

type ServerInvitePayload {
  serverInvite: ServerInvite!
}

`;
