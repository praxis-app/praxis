import gql from "graphql-tag";

export const VOTE = gql`
  query ($id: ID!) {
    vote(id: $id) {
      id
      userId
      motionId
      body
      flipState
      consensusState
    }
  }
`;

export const VOTES_BY_MOTION_ID = gql`
  query ($motionId: ID!) {
    votesByMotionId(motionId: $motionId) {
      id
      userId
      motionId
      body
      flipState
      consensusState
      verified
      createdAt
      updatedAt
    }
  }
`;
