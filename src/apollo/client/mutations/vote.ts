import { gql } from "@apollo/client";

export const CREATE_VOTE = gql`
  mutation CreateVoteMutation(
    $userId: ID!
    $motionId: ID!
    $body: String
    $flipState: String
    $consensusState: String
  ) {
    createVote(
      userId: $userId
      motionId: $motionId
      input: {
        body: $body
        flipState: $flipState
        consensusState: $consensusState
      }
    ) {
      vote {
        id
        body
        flipState
        consensusState
        userId
        motionId
        createdAt
      }
      motionRatified
    }
  }
`;

export const UPDATE_VOTE = gql`
  mutation UpdateVoteMutation(
    $id: ID!
    $body: String
    $flipState: String
    $consensusState: String
  ) {
    updateVote(
      id: $id
      input: {
        body: $body
        flipState: $flipState
        consensusState: $consensusState
      }
    ) {
      vote {
        id
        body
        flipState
        consensusState
        userId
        motionId
        createdAt
      }
      motionRatified
    }
  }
`;

export const DELETE_VOTE = gql`
  mutation DeleteVoteMutation($id: ID!) {
    deleteVote(id: $id)
  }
`;
