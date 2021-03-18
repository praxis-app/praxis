export default `

type Post {
  id: ID!
  userId: Int!
  body: String!
  createdAt: String!
  updatedAt: String!
}

input UpdatePostInput {
  body: String!
}

type PostPayload {
  post: Post!
}

`;
