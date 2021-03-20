export default `

type Post {
  id: ID!
  userId: Int!
  body: String!
  createdAt: String!
  updatedAt: String!
}

input CreatePostInput {
  body: String!
  images: [FileUpload]
}

input UpdatePostInput {
  body: String!
}

type PostPayload {
  post: Post!
}

`;
