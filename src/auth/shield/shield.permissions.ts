/**
 * TODO: Consider using fallbackRule instead of wild cards
 * https://the-guild.dev/graphql/shield/docs/advanced/whitelisting
 */

import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canApproveGroupMemberRequests,
  canBanMembers,
  canCreateInvites,
  canDeleteGroup,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageGroupSettings,
  canManageInvites,
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

const shieldPermissions = shield(
  {
    Query: {
      "*": isAuthenticated,
      isFirstUser: allow,
      users: canBanMembers,
      serverInvite: allow,
      serverInvites: or(canCreateInvites, canManageInvites),
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
      createServerInvite: or(canCreateInvites, canManageInvites),
      deleteServerInvite: canManageInvites,
      approveMemberRequest: canApproveGroupMemberRequests,
      updateGroupConfig: canManageGroupSettings,
      updateGroup: canUpdateGroup,
      deleteGroup: canDeleteGroup,
      createRole: or(canManageServerRoles, canManageGroupRoles),
      updateRole: or(canManageServerRoles, canManageGroupRoles),
      deleteRole: or(canManageServerRoles, canManageGroupRoles),
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

export default shieldPermissions;
