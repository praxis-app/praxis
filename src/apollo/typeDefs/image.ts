export default `

type Image {
  id: ID!
  userId: Int
  postId: Int
  path: String!
  createdAt: String!
  updatedAt: String!
}

type ImagePayload {
  image: Image!
}

`;
