import { gql } from "apollo-server-micro";
import User from "./user";
import Post from "./post";
import Image from "./image";
import Follow from "./follow";

export const typeDefs = gql`
  scalar FileUpload

  ${User}
  ${Post}
  ${Image}
  ${Follow}

  type Query {
    user(id: ID!): User!
    userByName(name: String!): User!
    allUsers: [User]!

    userFollowers(userId: ID!): [Follow]!
    userFollowersByName(name: String!): [Follow]!
    userFollowing(userId: ID!): [Follow]!
    userFollowingByName(name: String!): [Follow]!

    post(id: ID!): Post!
    allPosts: [Post]!

    allImages: [Image]!
    imagesByPostId(postId: ID!): [Image]!
  }

  type Mutation {
    signUp(input: SignUpInput!): UserPayload!
    signIn(input: SignInInput!): UserPayload!
    updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
    deleteUser(id: ID!): Boolean!

    createFollow(userId: ID!, followerId: ID!): FollowPayload!
    deleteFollow(id: ID!): Boolean!

    createPost(userId: ID!, input: CreatePostInput!): PostPayload!
    updatePost(id: ID!, input: UpdatePostInput!): PostPayload!
    deletePost(id: ID!): Boolean!

    uploadImage(image: FileUpload!, userId: ID!): ImagePayload!
    deleteImage(id: ID!): Boolean!
  }
`;
