export default `

type Event {
  id: ID
  groupId: ID!
  name: String!
  description: String!
  location: String
  startsAt: String!
  endsAt: String
  online: Boolean!
  externalLink: String
  createdAt: String!
  updatedAt: String!
}

input CreateEventInput {
  name: String!
  description: String!
  location: String
  startsAt: String!
  endsAt: String
  online: Boolean
  externalLink: String
  coverPhoto: FileUpload
}

input UpdateEventInput {
  name: String!
  description: String!
  location: String
  startsAt: String!
  endsAt: String
  online: Boolean
  externalLink: String
  coverPhoto: FileUpload
}

type EventPayload {
  event: Event!
}

type EventFeedPayload {
  pagedItems: [Post]
  totalItems: Int!
}

`;
