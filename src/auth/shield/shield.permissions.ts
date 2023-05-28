import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canApproveGroupMemberRequests,
  canBanMembers,
  canCreateInvites,
  canDeleteGroup,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageInvites,
  canManagePosts,
  canManageServerRoles,
  canUpdateGroup,
  hasValidRefreshToken,
  isAuthenticated,
  isOwnPost,
  isProposalGroupJoinedByMe,
  isPublicGroup,
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
      role: or(canManageServerRoles, canManageGroupRoles),
      group: or(isAuthenticated, isPublicGroup),
      publicGroupsFeed: allow,
      publicGroups: allow,

      // TODO: Remove when no longer needed for testing
      groups: allow,
    },
    Mutation: {
      "*": isAuthenticated,
      login: allow,
      logOut: allow,
      signUp: allow,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),
      createVote: isProposalGroupJoinedByMe,
      deletePost: or(isOwnPost, canManagePosts, canManageGroupPosts),
      createServerInvite: or(canCreateInvites, canManageInvites),
      deleteServerInvite: canManageInvites,
      approveMemberRequest: canApproveGroupMemberRequests,
      updateGroup: canUpdateGroup,
      deleteGroup: canDeleteGroup,
      createRole: or(canManageServerRoles, canManageGroupRoles),
      updateRole: or(canManageServerRoles, canManageGroupRoles),
      deleteRole: or(canManageServerRoles, canManageGroupRoles),
    },
    Group: {
      roles: canManageGroupRoles,
      memberRequests: canApproveGroupMemberRequests,
      memberRequestCount: canApproveGroupMemberRequests,
    },
  },
  {
    allowExternalErrors: true,
    fallbackError: FORBIDDEN,
  }
);

export default shieldPermissions;
