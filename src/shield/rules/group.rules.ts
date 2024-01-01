import { rule } from 'graphql-shield';
import { FindOptionsWhere } from 'typeorm';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { CreateGroupRoleInput } from '../../groups/group-roles/models/create-group-role.input';
import { DeleteGroupRoleMemberInput } from '../../groups/group-roles/models/delete-group-role-member.input';
import { GroupRole } from '../../groups/group-roles/models/group-role.model';
import { UpdateGroupRoleInput } from '../../groups/group-roles/models/update-group-role.input';
import { GroupPrivacy } from '../../groups/groups.constants';
import { GroupConfig } from '../../groups/models/group-config.model';
import { Group } from '../../groups/models/group.model';
import { UpdateGroupConfigInput } from '../../groups/models/update-group-config.input';
import { UpdateGroupInput } from '../../groups/models/update-group.input';
import { Image } from '../../images/models/image.model';
import { CreateVoteInput } from '../../votes/models/create-vote.input';
import { hasGroupPermission, hasServerPermission } from '../shield.utils';

export const canManageGroupRoles = rule()(async (
  parent,
  args:
    | { groupRoleData: CreateGroupRoleInput | UpdateGroupRoleInput }
    | { groupRoleMemberData: DeleteGroupRoleMemberInput }
    | { id: number },
  { permissions, services: { groupRolesService, groupsService } }: Context,
  info,
) => {
  let groupId: number | undefined;

  if ('groupRoleData' in args) {
    if (
      info.fieldName === 'createGroupRole' &&
      'groupId' in args.groupRoleData
    ) {
      groupId = args.groupRoleData.groupId;
    }
    if (info.fieldName === 'updateGroupRole' && 'id' in args.groupRoleData) {
      const role = await groupRolesService.getGroupRole({
        id: args.groupRoleData.id,
      });
      groupId = role.groupId;
    }
  } else if ('groupRoleMemberData' in args) {
    const role = await groupRolesService.getGroupRole({
      id: args.groupRoleMemberData.groupRoleId,
    });
    groupId = role.groupId;
  } else if (['role', 'deleteGroupRole'].includes(info.fieldName)) {
    const role = await groupRolesService.getGroupRole({ id: args.id });
    groupId = role.groupId;
  }
  if (info.fieldName === 'roles') {
    const { id } = parent as Group;
    groupId = id;
  }

  if (!groupId) {
    return false;
  }

  const isNoAdminGroup = await groupsService.isNoAdminGroup(groupId);
  if (isNoAdminGroup) {
    return false;
  }

  return hasGroupPermission(permissions, 'manageRoles', groupId);
});

export const canApproveGroupMemberRequests = rule({ cache: 'strict' })(async (
  parent,
  args,
  { permissions, services: { groupsService } }: Context,
  info,
) => {
  let groupId: number | undefined;

  if (info.fieldName === 'approveGroupMemberRequest') {
    const memberRequest = await groupsService.getGroupMemberRequest(
      { id: args.id },
      ['group'],
    );
    groupId = memberRequest?.group.id;
  }
  if (
    ['memberRequests', 'memberRequestCount'].includes(info.fieldName) &&
    info.parentType.name === Group.name
  ) {
    const group = parent as Group;
    groupId = group.id;
  }

  if (!groupId) {
    return false;
  }
  return hasGroupPermission(permissions, 'approveMemberRequests', groupId);
});

export const canUpdateGroup = rule()(async (
  _parent,
  { groupData }: { groupData: UpdateGroupInput },
  { permissions, services: { groupsService } }: Context,
) => {
  const isNoAdminGroup = await groupsService.isNoAdminGroup(groupData.id);
  if (isNoAdminGroup) {
    return false;
  }
  return hasGroupPermission(permissions, 'updateGroup', groupData.id);
});

export const canDeleteGroup = rule()(async (
  _parent,
  args: { id: number },
  { permissions, services: { groupsService } }: Context,
) => {
  const canRemoveGroups = hasServerPermission(permissions, 'removeGroups');
  if (canRemoveGroups) {
    return true;
  }
  const isNoAdminGroup = await groupsService.isNoAdminGroup(args.id);
  if (isNoAdminGroup) {
    return false;
  }
  return hasGroupPermission(permissions, 'deleteGroup', args.id);
});

export const canManageGroupPosts = rule({ cache: 'strict' })(async (
  _parent,
  args: { id: number },
  { permissions, services: { postsService } }: Context,
) => {
  const { groupId } = await postsService.getPost(args.id);
  return hasGroupPermission(permissions, 'managePosts', groupId);
});

export const canManageGroupComments = rule({ cache: 'strict' })(async (
  _parent,
  args: { id: number },
  { permissions, services: { commentsService } }: Context,
) => {
  const { post, proposal } = await commentsService.getComment(args.id, [
    'post',
    'post.event',
    'proposal',
  ]);
  const groupId = post?.groupId || post?.event?.groupId || proposal?.groupId;
  if (!groupId) {
    return false;
  }
  return hasGroupPermission(permissions, 'manageComments', groupId);
});

export const canManageGroupSettings = rule()(async (
  _parent,
  args: { groupConfigData: UpdateGroupConfigInput },
  { permissions, services: { groupsService } }: Context,
) => {
  const isNoAdminGroup = await groupsService.isNoAdminGroup(
    args.groupConfigData.groupId,
  );
  if (isNoAdminGroup) {
    return false;
  }
  return hasGroupPermission(
    permissions,
    'manageSettings',
    args.groupConfigData.groupId,
  );
});

export const canCreateGroupEvents = rule()(async (
  _parent,
  args,
  { services: { shieldService, groupsService }, permissions }: Context,
) => {
  const groupId = await shieldService.getGroupIdFromEventArgs(args);
  if (!groupId) {
    return false;
  }
  const isNoAdminGroup = await groupsService.isNoAdminGroup(groupId);
  if (isNoAdminGroup) {
    return false;
  }
  return hasGroupPermission(permissions, 'createEvents', groupId);
});

export const canManageGroupEvents = rule()(async (
  _parent,
  args,
  { services: { shieldService, groupsService }, permissions }: Context,
) => {
  const groupId = await shieldService.getGroupIdFromEventArgs(args);
  if (!groupId) {
    return false;
  }
  const isNoAdminGroup = await groupsService.isNoAdminGroup(groupId);
  if (isNoAdminGroup) {
    return false;
  }
  return hasGroupPermission(permissions, 'manageEvents', groupId);
});

export const isGroupMember = rule({ cache: 'strict' })(async (
  parent: Group | undefined,
  args: { id: number },
  { user, services: { groupsService, groupRolesService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if (parent) {
    return groupsService.isGroupMember(parent.id, user.id);
  }
  const { groupId } = await groupRolesService.getGroupRole({
    id: args.id,
  });
  return groupsService.isGroupMember(groupId, user.id);
});

export const isPublicGroup = rule({ cache: 'strict' })(async (
  parent: Group | GroupConfig | null,
  args: { id: number; name: string } | null,
  { services: { groupsService } }: Context,
) => {
  let where: FindOptionsWhere<Group> = {};

  if (parent instanceof Group) {
    where = { id: parent.id };
  } else if (parent instanceof GroupConfig) {
    where = { id: parent.groupId };
  } else if (args) {
    where = { id: args.id, name: args.name };
  }
  if (!where.id && !where.name) {
    return false;
  }
  const { config } = await groupsService.getGroup(where, ['config']);
  return config.privacy === GroupPrivacy.Public;
});

export const isPublicGroupRole = rule({ cache: 'strict' })(async (
  parent: GroupRole,
  _args,
  { services: { groupsService } }: Context,
) => {
  const group = await groupsService.getGroup({ id: parent.groupId }, [
    'config',
  ]);
  return group.config.privacy === GroupPrivacy.Public;
});

export const isPublicGroupImage = rule({ cache: 'strict' })(
  async (parent: Image, _args, { services: { groupsService } }: Context) =>
    groupsService.isPublicGroupImage(parent.id),
);

export const isProposalGroupJoinedByMe = rule({ cache: 'strict' })(async (
  _parent,
  { voteData }: { voteData: CreateVoteInput },
  { user, services: { groupsService, proposalsService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  const { group } = await proposalsService.getProposal(voteData.proposalId, [
    'group',
  ]);
  if (group) {
    const isJoinedByUser = await groupsService.isGroupMember(group.id, user.id);
    if (!isJoinedByUser) {
      return 'You must be a group member to vote on this proposal';
    }
  }
  return true;
});
