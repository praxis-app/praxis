export default `

type Post {
  id: ID!
  userId: ID!
  groupId: ID
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
  images: [FileUpload]
}

type PostPayload {
  post: Post!
}

`;
