export default `

type Group {
  id: ID!
  creatorId: ID!
  name: String!
  description: String
  createdAt: String!
  updatedAt: String!
}

input CreateGroupInput {
  name: String!
  description: String
  coverPhoto: FileUpload
}

input UpdateGroupInput {
  name: String!
  description: String
  coverPhoto: FileUpload
}

type GroupPayload {
  group: Group!
}

`;
