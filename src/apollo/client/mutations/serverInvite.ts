import { gql } from "@apollo/client";
import { SERVER_INVITE_SUMMARY } from "../fragments";

export const CREATE_SERVER_INVITE = gql`
  mutation CreateServerInviteMutation(
    $userId: ID!
    $maxUses: Int
    $expiresAt: String
  ) {
    createServerInvite(
      userId: $userId
      input: { maxUses: $maxUses, expiresAt: $expiresAt }
    ) {
      serverInvite {
        ...ServerInviteSummary
      }
    }
  }
  ${SERVER_INVITE_SUMMARY}
`;

export const REDEEM_SERVER_INVITE = gql`
  mutation RedeemServerInviteMutation($token: String!) {
    redeemServerInvite(token: $token) {
      serverInvite {
        ...ServerInviteSummary
      }
    }
  }
  ${SERVER_INVITE_SUMMARY}
`;

export const DELETE_SERVER_INVITE = gql`
  mutation DeleteServerInviteMutation($id: ID!) {
    deleteServerInvite(id: $id)
  }
`;
