export default `

type Image {
  id: ID!
  userId: ID
  postId: ID
  commentId: ID
  path: String!
  createdAt: String!
  updatedAt: String!
}

type ImagePayload {
  image: Image!
}

`;
