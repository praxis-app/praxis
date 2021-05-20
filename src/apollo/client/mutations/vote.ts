import { gql } from "@apollo/client";

export const CREATE_VOTE = gql`
  mutation CreateVoteMutation(
    $userId: ID!
    $motionId: ID!
    $body: String
    $flipState: String
  ) {
    createVote(
      userId: $userId
      motionId: $motionId
      input: { body: $body, flipState: $flipState }
    ) {
      vote {
        id
        body
        flipState
        verified
        userId
        motionId
        createdAt
      }
      motionRatified
    }
  }
`;

export const UPDATE_VOTE = gql`
  mutation UpdateVoteMutation($id: ID!, $body: String, $flipState: String) {
    updateVote(id: $id, input: { body: $body, flipState: $flipState }) {
      vote {
        id
        body
        flipState
        verified
        userId
        motionId
        createdAt
      }
      motionRatified
    }
  }
`;

export const VERIFY_VOTE = gql`
  mutation VerifyVoteMutation($id: ID!) {
    verifyVote(id: $id) {
      vote {
        id
        body
        flipState
        verified
        userId
        motionId
        createdAt
      }
    }
  }
`;

export const DELETE_VOTE = gql`
  mutation DeleteVoteMutation($id: ID!) {
    deleteVote(id: $id)
  }
`;
