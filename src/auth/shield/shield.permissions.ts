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
      isFirstUser: allow,
      serverInvite: allow,
      serverInvites: or(canCreateInvites, canManageInvites),
      users: canBanMembers,
    },
    Mutation: {
      "*": isAuthenticated,
      login: allow,
      logOut: allow,
      signUp: allow,
      createServerInvite: or(canCreateInvites, canManageInvites),
      createVote: isProposalGroupJoinedByMe,
      deletePost: or(canManagePosts, isOwnPost),
      deleteServerInvite: canManageInvites,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),
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
