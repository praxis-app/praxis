export default `

type Motion {
  id: ID!
  userId: ID!
  groupId: ID!
  body: String!
  action: String
  stage: String!
  createdAt: String!
  updatedAt: String!
}

input CreateMotionInput {
  body: String!
  action: String
  images: [FileUpload]
}

input UpdateMotionInput {
  body: String!
  action: String
  images: [FileUpload]
}

type MotionPayload {
  motion: Motion!
}

`;
