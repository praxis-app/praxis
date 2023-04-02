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
      isFirstUser: allow,
      users: canBanMembers,
      serverInvite: allow,
      serverInvites: or(canCreateInvites, canManageInvites),
      serverRoles: canManageServerRoles,
      memberRequests: canApproveGroupMemberRequests,
    },
    Mutation: {
      "*": isAuthenticated,
      login: allow,
      logOut: allow,
      signUp: allow,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),
      createVote: isProposalGroupJoinedByMe,
      deletePost: or(canManagePosts, isOwnPost),
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
