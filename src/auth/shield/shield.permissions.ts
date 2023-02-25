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
} from "./shield.rules";

const shieldPermissions = shield(
  {
    Query: {
      "*": isAuthenticated,
      users: canBanMembers,
      serverInvite: allow,
      serverInvites: or(canCreateInvites, canManageInvites),
    },
    Mutation: {
      "*": isAuthenticated,
      login: allow,
      logOut: allow,
      signUp: allow,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),
      deletePost: or(canManagePosts, isOwnPost),
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
