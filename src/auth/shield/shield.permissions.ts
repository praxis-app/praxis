/**
 * TODO: Consider using fallbackRule instead of wild cards
 * https://the-guild.dev/graphql/shield/docs/advanced/whitelisting
 */

import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canApproveGroupMemberRequests,
  canRemoveMembers,
  canCreateServerInvites,
  canDeleteGroup,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageGroupSettings,
  canManageServerInvites,
  canManagePosts,
  canManageServerRoles,
  canUpdateGroup,
  isGroupMember,
  hasValidRefreshToken,
  isAuthenticated,
  isOwnPost,
  isProposalGroupJoinedByMe,
  isPublicGroup,
  isPublicGroupPost,
  isPublicGroupProposal,
} from "./shield.rules";

export const shieldPermissions = shield(
  {
    Query: {
      "*": isAuthenticated,
      isFirstUser: allow,
      users: canRemoveMembers,
      serverInvite: allow,
      serverInvites: or(canCreateServerInvites, canManageServerInvites),
      post: or(isAuthenticated, isPublicGroupPost),
      proposal: or(isAuthenticated, isPublicGroupProposal),
      group: or(isAuthenticated, isPublicGroup),
      groupRole: isGroupMember,
      publicGroupsFeed: allow,
      publicGroups: allow,
    },
    Mutation: {
      "*": isAuthenticated,
      login: allow,
      logOut: allow,
      signUp: allow,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),
      createVote: isProposalGroupJoinedByMe,
      deletePost: or(isOwnPost, canManagePosts, canManageGroupPosts),
      createServerInvite: or(canCreateServerInvites, canManageServerInvites),
      deleteServerInvite: canManageServerInvites,
      createServerRole: canManageServerRoles,
      updateServerRole: canManageServerRoles,
      deleteServerRole: canManageServerRoles,
      deleteServerRoleMember: canManageServerRoles,
      approveGroupMemberRequest: canApproveGroupMemberRequests,
      updateGroupConfig: canManageGroupSettings,
      updateGroup: canUpdateGroup,
      deleteGroup: canDeleteGroup,
      createGroupRole: canManageGroupRoles,
      updateGroupRole: canManageGroupRoles,
      deleteGroupRole: canManageGroupRoles,
      deleteGroupRoleMember: canManageGroupRoles,
    },
    Group: {
      roles: isGroupMember,
      memberRequests: canApproveGroupMemberRequests,
      memberRequestCount: canApproveGroupMemberRequests,
    },
  },
  {
    allowExternalErrors: true,
    fallbackError: FORBIDDEN,
  }
);
