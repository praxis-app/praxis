import { gql } from "apollo-server-micro";
import User from "./user";
import Post from "./post";
import Image from "./image";

export const typeDefs = gql`
  scalar FileUpload

  ${User}
  ${Post}
  ${Image}

  type Query {
    user(id: ID!): User!
    userByName(name: String!): User!
    allUsers: [User]
    post(id: ID!): Post!
    allPosts: [Post]
    allImages: [Image]
    imagesByPostId(postId: ID!): [Image]
  }

  type Mutation {
    signUp(input: SignUpInput!): UserPayload!
    signIn(input: SignInInput!): UserPayload!
    updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
    deleteUser(id: ID!): Boolean!

    createPost(body: String!, images: [FileUpload], userId: ID!): PostPayload!
    updatePost(id: ID!, input: UpdatePostInput!): PostPayload!
    deletePost(id: ID!): Boolean!

    uploadImage(image: FileUpload!, userId: ID!): ImagePayload!
    deleteImage(id: ID!): Boolean!
  }
`;
