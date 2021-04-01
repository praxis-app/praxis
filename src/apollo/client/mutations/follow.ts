import { gql } from "@apollo/client";

export const CREATE_FOLLOW = gql`
  mutation CreateFollowMutation($userId: ID!, $followerId: ID!) {
    createFollow(userId: $userId, followerId: $followerId) {
      follow {
        id
        userId
        followerId
        createdAt
      }
    }
  }
`;

export const DELETE_FOLLOW = gql`
  mutation DeleteFollowMutation($id: ID!) {
    deleteFollow(id: $id)
  }
`;
