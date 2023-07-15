/**
 * TODO: Consider using fallbackRule instead of wild cards
 * https://the-guild.dev/graphql/shield/docs/advanced/whitelisting
 */

import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canApproveGroupMemberRequests,
  canCreateGroupEvents,
  canCreateServerInvites,
  canDeleteGroup,
  canManageEvents,
  canManageGroupEvents,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageGroupSettings,
  canManagePosts,
  canManageServerInvites,
  canManageServerRoles,
  canRemoveMembers,
  canUpdateGroup,
  hasValidRefreshToken,
  isAuthenticated,
  isGroupMember,
  isOwnPost,
  isProposalGroupJoinedByMe,
  isPublicEvent,
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
      event: or(isAuthenticated, isPublicEvent),
      groupRole: isGroupMember,
      publicGroupsFeed: allow,
      publicGroups: allow,
      publicEvents: allow,
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
      createEvent: or(canCreateGroupEvents, canManageGroupEvents),
      deleteEvent: or(canManageEvents, canManageGroupEvents),
      updateEvent: canManageGroupEvents,
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
