export default `

type Motion {
  id: ID!
  userId: ID!
  groupId: ID!
  body: String!
  action: String
  actionData: JSON
  stage: String!
  createdAt: String!
  updatedAt: String!
}

input ActionDataInput {
  newGroupName: String
  newGroupImage: FileUpload
  newGroupDescription: String
}

input CreateMotionInput {
  body: String!
  action: String
  actionData: ActionDataInput
  images: [FileUpload]
}

input UpdateMotionInput {
  body: String
  action: String
  actionData: ActionDataInput
  images: [FileUpload]
}

type MotionPayload {
  motion: Motion!
}

`;
