import { gql } from "apollo-server-micro";
import User from "./user";
import Post from "./post";
import Motion from "./motion";
import Vote from "./vote";
import Comment from "./comment";
import Like from "./like";
import Follow from "./follow";
import Group from "./group";
import Member from "./member";
import Image from "./image";

export const typeDefs = gql`
  scalar FileUpload

  ${User}
  ${Post}
  ${Motion}
  ${Vote}
  ${Comment}
  ${Like}
  ${Follow}
  ${Group}
  ${Member}
  ${Image}

  union FeedItem = Post | Motion

  type Query {
    user(id: ID!): User!
    userByName(name: String!): User!
    allUsers: [User]!
    homeFeed(userId: ID): [FeedItem]

    userFollowers(userId: ID!): [Follow]!
    userFollowersByName(name: String!): [Follow]!
    userFollowing(userId: ID!): [Follow]!
    userFollowingByName(name: String!): [Follow]!

    post(id: ID!): Post!
    allPosts: [Post]!
    postsByUserName(name: String!): [Post]
    postsByGroupName(name: String!): [Post]

    motion(id: ID!): Motion!
    motionsByUserName(name: String!): [Motion]
    motionsByGroupName(name: String!): [Motion]

    vote(id: ID!): Vote!
    votesByMotionId(motionId: ID!): [Vote]

    comment(id: ID!): Comment!
    commentsByPostId(postId: ID!): [Comment]
    commentsByMotionId(motionId: ID!): [Comment]

    likesByPostId(postId: ID!): [Like]!
    likesByMotionId(motionId: ID!): [Like]!
    likesByCommentId(commentId: ID!): [Like]!

    group(id: ID!): Group!
    groupByName(name: String!): Group!
    allGroups: [Group]!
    groupFeed(name: String!): [FeedItem]

    groupMembers(groupId: ID!): [GroupMember]
    memberRequests(groupId: ID!): [MemberRequest]

    allImages: [Image]!
    imagesByPostId(postId: ID!): [Image]
    imagesByMotionId(motionId: ID!): [Image]
    imagesByCommentId(commentId: ID!): [Image]
    currentProfilePicture(userId: ID!): Image
    profilePictures(userId: ID!): [Image]
    currentCoverPhoto(groupId: ID!): Image
  }

  type Mutation {
    signUp(input: SignUpInput!): UserPayload!
    signIn(input: SignInInput!): UserPayload!
    updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
    deleteUser(id: ID!): Boolean!

    createFollow(userId: ID!, followerId: ID!): FollowPayload!
    deleteFollow(id: ID!): Boolean!

    createPost(userId: ID!, groupId: ID, input: CreatePostInput!): PostPayload!
    updatePost(id: ID!, input: UpdatePostInput!): PostPayload!
    deletePost(id: ID!): Boolean!

    createMotion(
      userId: ID!
      groupId: ID
      input: CreateMotionInput!
    ): MotionPayload!
    updateMotion(id: ID!, input: UpdateMotionInput!): MotionPayload!
    deleteMotion(id: ID!): Boolean!

    createVote(userId: ID!, motionId: ID, input: CreateVoteInput!): VotePayload!
    updateVote(id: ID!, input: UpdateVoteInput!): VotePayload!
    verifyVote(id: ID!): VotePayload!
    deleteVote(id: ID!): Boolean!

    createComment(
      userId: ID!
      postId: ID
      motionId: ID
      input: CreateCommentInput!
    ): CommentPayload!
    updateComment(id: ID!, input: UpdateCommentInput!): CommentPayload!
    deleteComment(id: ID!): Boolean!

    createLike(
      userId: ID!
      postId: ID
      motionId: ID
      commentId: ID
    ): LikePayload!
    deleteLike(id: ID!): Boolean!

    createGroup(creatorId: ID!, input: CreateGroupInput!): GroupPayload!
    updateGroup(id: ID!, input: UpdateGroupInput!): GroupPayload!
    deleteGroup(id: ID!): Boolean!

    createMemberRequest(groupId: ID!, userId: ID!): MemberRequestPayload!
    deleteMemberRequest(id: ID!): Boolean!
    deleteGroupMember(id: ID!): Boolean!
    approveMemberRequest(id: ID!): GroupMemberPayload!
    denyMemberRequest(id: ID!): MemberRequestPayload!

    uploadImage(image: FileUpload!, userId: ID!): ImagePayload!
    deleteImage(id: ID!): Boolean!
  }
`;
