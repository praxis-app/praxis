import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canApproveGroupMemberRequests,
  canBanMembers,
  canCreateInvites,
  canManageInvites,
  canManagePosts,
  canManageServerRoles,
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

      // Roles & Permissions
      serverRoles: canManageServerRoles,
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
      deletePost: or(canManagePosts, isOwnPost),

      // Server Invites
      createServerInvite: or(canCreateInvites, canManageInvites),
      deleteServerInvite: canManageInvites,

      approveMemberRequest: canApproveGroupMemberRequests,
    },
  },
  {
    allowExternalErrors: true,
    fallbackError: FORBIDDEN,
  }
);

export default shieldPermissions;
