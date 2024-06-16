import { allow, or } from 'graphql-shield';
import {
  canApproveGroupMemberRequests,
  canDeleteGroup,
  canManageGroupRoles,
  canManageGroupSettings,
  canUpdateGroup,
  isGroupMember,
  isPublicGroup,
  isPublicGroupRole,
} from '../rules/group.rules';
import { isVerified } from '../rules/user.rules';

export const groupPermissions = {
  Query: {
    group: or(isVerified, isPublicGroup),
    groupRole: isGroupMember,
    publicGroups: allow,
    publicGroupsCount: allow,
    publicGroupsFeed: allow,
    groupsCount: allow,
  },
  Mutation: {
    approveGroupMemberRequest: canApproveGroupMemberRequests,
    createGroupRole: canManageGroupRoles,
    deleteGroup: canDeleteGroup,
    deleteGroupRole: canManageGroupRoles,
    deleteGroupRoleMember: canManageGroupRoles,
    updateGroup: canUpdateGroup,
    updateGroupConfig: canManageGroupSettings,
    updateGroupRole: canManageGroupRoles,
  },
  ObjectTypes: {
    Group: {
      id: or(isVerified, isPublicGroup),
      name: or(isVerified, isPublicGroup),
      description: or(isVerified, isPublicGroup),
      coverPhoto: or(isVerified, isPublicGroup),
      feed: or(isVerified, isPublicGroup),
      feedCount: or(isVerified, isPublicGroup),
      futureEvents: or(isVerified, isPublicGroup),
      memberCount: or(isVerified, isPublicGroup),
      memberRequestCount: canApproveGroupMemberRequests,
      memberRequests: canApproveGroupMemberRequests,
      pastEvents: or(isVerified, isPublicGroup),
      settings: or(isVerified, isPublicGroup),
      roles: isGroupMember,
    },
    GroupRole: {
      id: or(isVerified, isPublicGroupRole),
      name: or(isVerified, isPublicGroupRole),
      color: or(isVerified, isPublicGroupRole),
    },
    GroupConfig: or(isVerified, isPublicGroup),
  },
};
