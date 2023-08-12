import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../common/common.constants";
import { hasValidRefreshToken, isAuthenticated } from "./rules/auth.rules";
import {
  isPublicEvent,
  isPublicEventImage,
  isPublicEventPost,
} from "./rules/event.rules";
import {
  canApproveGroupMemberRequests,
  canCreateGroupEvents,
  canDeleteGroup,
  canManageGroupEvents,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageGroupSettings,
  canUpdateGroup,
  isGroupMember,
  isProposalGroupJoinedByMe,
  isPublicGroup,
  isPublicGroupImage,
  isPublicGroupRole,
} from "./rules/group.rules";
import { isOwnPost, isPublicPost, isPublicPostImage } from "./rules/post.rules";
import {
  isPublicProposal,
  isPublicProposalAction,
  isPublicProposalImage,
  isPublicVote,
} from "./rules/proposal.rules";
import {
  canCreateServerInvites,
  canManageEvents,
  canManagePosts,
  canManageServerInvites,
  canManageServerRoles,
  canRemoveMembers,
} from "./rules/role.rules";
import { isPublicUserAvatar, isUserInPublicGroups } from "./rules/user.rules";

export const shieldPermissions = shield(
  {
    Query: {
      isFirstUser: allow,
      users: canRemoveMembers,
      serverInvite: allow,
      serverInvites: or(canCreateServerInvites, canManageServerInvites),
      post: or(isAuthenticated, isPublicPost),
      proposal: or(isAuthenticated, isPublicProposal),
      group: or(isAuthenticated, isPublicGroup),
      event: or(isAuthenticated, isPublicEvent),
      groupRole: isGroupMember,
      publicGroupsFeed: allow,
      publicGroups: allow,
      publicGroup: allow,
      publicPost: allow,
      events: allow,
    },
    Mutation: {
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
      updateEvent: or(canManageEvents, canManageGroupEvents),
    },
    User: {
      id: or(isAuthenticated, isUserInPublicGroups),
      name: or(isAuthenticated, isUserInPublicGroups),
      profilePicture: or(isAuthenticated, isUserInPublicGroups),
    },
    Group: {
      id: or(isAuthenticated, isPublicGroup),
      name: or(isAuthenticated, isPublicGroup),
      description: or(isAuthenticated, isPublicGroup),
      coverPhoto: or(isAuthenticated, isPublicGroup),
      settings: or(isAuthenticated, isPublicGroup),
      feed: or(isAuthenticated, isPublicGroup),
      futureEvents: or(isAuthenticated, isPublicGroup),
      pastEvents: or(isAuthenticated, isPublicGroup),
      memberCount: or(isAuthenticated, isPublicGroup),
      memberRequests: canApproveGroupMemberRequests,
      memberRequestCount: canApproveGroupMemberRequests,
      roles: isGroupMember,
    },
    GroupRole: {
      id: or(isAuthenticated, isPublicGroupRole),
      name: or(isAuthenticated, isPublicGroupRole),
      color: or(isAuthenticated, isPublicGroupRole),
    },
    GroupConfig: {
      isPublic: or(isAuthenticated, isPublicGroup),
    },
    Image: {
      id: or(
        isAuthenticated,
        isPublicEventImage,
        isPublicGroupImage,
        isPublicPostImage,
        isPublicProposalImage,
        isPublicUserAvatar
      ),
      filename: or(isAuthenticated, isPublicPostImage, isPublicProposalImage),
    },
    ServerInvite: {
      id: allow,
      token: allow,
    },
    Event: or(isAuthenticated, isPublicEvent),
    Post: or(isAuthenticated, isPublicPost, isPublicEventPost),
    Proposal: or(isAuthenticated, isPublicProposal),
    ProposalAction: or(isAuthenticated, isPublicProposalAction),
    ProposalActionPermission: or(isAuthenticated, isPublicProposalAction),
    ProposalActionRole: or(isAuthenticated, isPublicProposalAction),
    ProposalActionRoleMember: or(isAuthenticated, isPublicProposalAction),
    Vote: or(isAuthenticated, isPublicVote),
  },
  {
    fallbackRule: isAuthenticated,
    fallbackError: FORBIDDEN,
    allowExternalErrors: true,
  }
);
