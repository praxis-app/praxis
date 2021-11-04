export default `

type User {
  id: ID!
  name: String!
  email: String!
  bio: String
  password: String!
  createdAt: String!
  updatedAt: String!
}

input SignUpInput {
  name: String!
  email: String!
  password: String!
  passwordConfirm: String!
  profilePicture: FileUpload
}

input SignInInput {
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String!
  email: String!
  bio: String!
  profilePicture: FileUpload
  coverPhoto: FileUpload
}

input SelectedUserInput {
  userId: String!
}

type UserPayload {
  user: User!
  token: String!
}

`;
