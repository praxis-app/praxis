import gql from "graphql-tag";
import { SERVER_INVITE_SUMMARY } from "../fragments";

export const SERVER_INVITE = gql`
  query ($id: ID!) {
    serverInvite(id: $id) {
      ...ServerInviteSummary
    }
  }
  ${SERVER_INVITE_SUMMARY}
`;

export const SERVER_INVITE_BY_TOKEN = gql`
  query ($token: String!) {
    serverInviteByToken(token: $token) {
      ...ServerInviteSummary
    }
  }
  ${SERVER_INVITE_SUMMARY}
`;

export const SERVER_INVITES = gql`
  {
    allServerInvites {
      ...ServerInviteSummary
    }
  }
  ${SERVER_INVITE_SUMMARY}
`;
