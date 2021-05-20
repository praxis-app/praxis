export default `

type Vote {
  id: ID!
  userId: ID!
  motionId: ID!
  body: String
  flipState: String
  verified: Boolean!
  createdAt: String!
  updatedAt: String!
}

input CreateVoteInput {
  body: String
  flipState: String
}

input UpdateVoteInput {
  body: String
  flipState: String
}

type VotePayload {
  vote: Vote!
  motionRatified: Boolean!
}

`;
