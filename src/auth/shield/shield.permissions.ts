import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canBanMembers,
  canCreateInvites,
  canManageInvites,
  canManagePosts,
  canManageRoles,
  hasValidRefreshToken,
  isAuthenticated,
  isOwnPost,
  isProposalGroupJoinedByMe,
} from "./shield.rules";

const shieldPermissions = shield(
  {
    Query: {
      "*": isAuthenticated,

      // Users
      isFirstUser: allow,
      users: canBanMembers,

      // Server Invites
      serverInvite: allow,
      serverInvites: or(canCreateInvites, canManageInvites),
    },
    Mutation: {
      "*": isAuthenticated,

      // Auth
      login: allow,
      logOut: allow,
      signUp: allow,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),

      // Votes
      createVote: isProposalGroupJoinedByMe,
      updateVote: isProposalGroupJoinedByMe,
      deleteVote: isProposalGroupJoinedByMe,
      deletePost: or(canManagePosts, isOwnPost),

      // Server Invites
      createServerInvite: or(canCreateInvites, canManageInvites),
      deleteServerInvite: canManageInvites,
    },
    Role: canManageRoles,
    RoleMember: canManageRoles,
  },
  {
    allowExternalErrors: true,
    fallbackError: FORBIDDEN,
  }
);

export default shieldPermissions;
