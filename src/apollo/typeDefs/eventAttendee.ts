export default `

type EventAttendee {
  id: ID
  eventId: ID!
  userId: ID!
  status: String!
  createdAt: String!
  updatedAt: String!
}

input CreateEventAttendeeInput {
  status: String!
}

type EventAttendeePayload {
  eventAttendee: EventAttendee!
}

`;
