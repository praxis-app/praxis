import { gql } from "@apollo/client";

export const SERVER_INVITE_SUMMARY = gql`
  fragment ServerInviteSummary on ServerInvite {
    id
    userId
    token
    uses
    maxUses
    expiresAt
    createdAt
  }
`;
