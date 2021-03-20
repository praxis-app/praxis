export default `

type Follow {
  id: ID!
  userId: ID!
  followerId: ID!
  createdAt: String!
  updatedAt: String!
}

type FollowPayload {
  follow: Follow!
}

`;
