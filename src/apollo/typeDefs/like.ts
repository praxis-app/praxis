export default `

type Like {
  id: ID!
  userId: ID!
  postId: ID
  motionId: ID
  commentId: ID
  createdAt: String!
  updatedAt: String!
}

type LikePayload {
  like: Like!
}

`;
