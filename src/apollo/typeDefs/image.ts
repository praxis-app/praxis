export default `

type Image {
  id: ID!
  userId: ID
  postId: ID
  motionId: ID
  commentId: ID
  groupId: ID
  profilePicture: Boolean
  path: String!
  createdAt: String!
  updatedAt: String!
}

type ImagePayload {
  image: Image!
}

`;
