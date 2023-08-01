import { rule } from "graphql-shield";
import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../context/context.types";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";
import { UpdateGroupConfigInput } from "../../groups/group-configs/models/update-group-config.input";
import { CreateGroupRoleInput } from "../../groups/group-roles/models/create-group-role.input";
import { DeleteGroupRoleMemberInput } from "../../groups/group-roles/models/delete-group-role-member.input";
import { UpdateGroupRoleInput } from "../../groups/group-roles/models/update-group-role.input";
import { Group } from "../../groups/models/group.model";
import { UpdateGroupInput } from "../../groups/models/update-group.input";
import { CreateVoteInput } from "../../votes/models/create-vote.input";
import { getJti, getSub } from "../auth.utils";
import { hasGroupPermission, hasServerPermission } from "./shield.utils";

export const canCreateServerInvites = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, "createInvites")
);

export const canManageServerInvites = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, "manageInvites")
);

export const canManagePosts = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, "managePosts")
);

export const canManageEvents = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, "manageEvents")
);

export const canManageServerRoles = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, "manageRoles")
);

export const canRemoveMembers = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, "removeMembers")
);

export const canUpdateGroup = rule()(
  async (
    _parent,
    { groupData }: { groupData: UpdateGroupInput },
    { permissions }: Context
  ) => hasGroupPermission(permissions, "updateGroup", groupData.id)
);

export const canDeleteGroup = rule()(
  async (_parent, args: { id: number }, { permissions }: Context) =>
    hasGroupPermission(permissions, "deleteGroup", args.id)
);

export const canManageGroupPosts = rule()(
  async (
    _parent,
    args: { id: number },
    { permissions, services: { postsService } }: Context
  ) => {
    const { groupId } = await postsService.getPost(args.id);
    return hasGroupPermission(permissions, "managePosts", groupId);
  }
);

export const canManageGroupSettings = rule()(
  async (
    _parent,
    args: { groupConfigData: UpdateGroupConfigInput },
    { permissions }: Context
  ) =>
    hasGroupPermission(
      permissions,
      "manageSettings",
      args.groupConfigData.groupId
    )
);

export const canCreateGroupEvents = rule()(
  async (
    _parent,
    args,
    { services: { shieldService }, permissions }: Context
  ) => {
    const groupId = await shieldService.getGroupIdFromEventArgs(args);
    if (!groupId) {
      return false;
    }
    return hasGroupPermission(permissions, "createEvents", groupId);
  }
);

export const canManageGroupEvents = rule()(
  async (
    _parent,
    args,
    { services: { shieldService }, permissions }: Context
  ) => {
    const groupId = await shieldService.getGroupIdFromEventArgs(args);
    if (!groupId) {
      return false;
    }
    return hasGroupPermission(permissions, "manageEvents", groupId);
  }
);

export const canManageGroupRoles = rule()(
  async (
    parent,
    args:
      | { groupRoleData: CreateGroupRoleInput | UpdateGroupRoleInput }
      | { groupRoleMemberData: DeleteGroupRoleMemberInput }
      | { id: number },
    { permissions, services: { groupRolesService } }: Context,
    info
  ) => {
    let groupId: number | undefined;

    if ("groupRoleData" in args) {
      if (
        info.fieldName === "createGroupRole" &&
        "groupId" in args.groupRoleData
      ) {
        groupId = args.groupRoleData.groupId;
      }
      if (info.fieldName === "updateGroupRole" && "id" in args.groupRoleData) {
        const role = await groupRolesService.getGroupRole({
          id: args.groupRoleData.id,
        });
        groupId = role.groupId;
      }
    } else if ("groupRoleMemberData" in args) {
      const role = await groupRolesService.getGroupRole({
        id: args.groupRoleMemberData.groupRoleId,
      });
      groupId = role.groupId;
    } else if (["role", "deleteGroupRole"].includes(info.fieldName)) {
      const role = await groupRolesService.getGroupRole({ id: args.id });
      groupId = role.groupId;
    }
    if (info.fieldName === "roles") {
      const { id } = parent as Group;
      groupId = id;
    }

    if (!groupId) {
      return false;
    }
    return hasGroupPermission(permissions, "manageRoles", groupId);
  }
);

export const canApproveGroupMemberRequests = rule()(
  async (
    parent,
    args,
    { permissions, services: { groupMemberRequestsService } }: Context,
    info
  ) => {
    let groupId: number | undefined;

    if (info.fieldName === "approveGroupMemberRequest") {
      const memberRequest =
        await groupMemberRequestsService.getGroupMemberRequest(
          { id: args.id },
          ["group"]
        );
      groupId = memberRequest?.group.id;
    }
    if (
      ["memberRequests", "memberRequestCount"].includes(info.fieldName) &&
      info.parentType.name === Group.name
    ) {
      const group = parent as Group;
      groupId = group.id;
    }

    if (!groupId) {
      return false;
    }
    return hasGroupPermission(permissions, "approveMemberRequests", groupId);
  }
);

export const isGroupMember = rule()(
  async (
    parent: Group | undefined,
    args: { id: number },
    { user, services: { groupsService, groupRolesService } }: Context
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
  }
);

export const isAuthenticated = rule({ cache: "contextual" })(
  async (_parent, _args, { user }: Context) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return true;
  }
);

export const hasValidRefreshToken = rule()(
  async (
    _parent,
    _args,
    {
      claims: { refreshTokenClaims },
      services: { refreshTokensService },
    }: Context
  ) => {
    const jti = getJti(refreshTokenClaims);
    const sub = getSub(refreshTokenClaims);
    if (!jti || !sub) {
      return UNAUTHORIZED;
    }
    return refreshTokensService.validateRefreshToken(jti, sub);
  }
);

export const isOwnPost = rule()(
  async (_parent, args, { user, services: { usersService } }: Context) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return usersService.isUsersPost(args.id, user.id);
  }
);

export const isPublicGroup = rule()(
  async (_parent, args, { services: { groupsService } }: Context) => {
    const group = await groupsService.getGroup(
      { id: args.id, name: args.name },
      ["config"]
    );
    return group.config.privacy === GroupPrivacy.Public;
  }
);

export const isPublicGroupPost = rule()(
  async (_parent, args, { services: { postsService } }: Context) => {
    const post = await postsService.getPost(args.id, ["group.config"]);
    if (!post.group) {
      return false;
    }
    return post.group.config.privacy === GroupPrivacy.Public;
  }
);

export const isPublicGroupProposal = rule()(
  async (_parent, args, { services: { proposalsService } }: Context) => {
    const proposal = await proposalsService.getProposal(args.id, [
      "group.config",
    ]);
    return proposal.group.config.privacy === GroupPrivacy.Public;
  }
);

export const isPublicEvent = rule()(
  async (
    _parent,
    args: { id: number },
    { services: { eventsService } }: Context
  ) => {
    const event = await eventsService.getEvent({
      id: args.id,
      group: {
        config: { privacy: GroupPrivacy.Public },
      },
    });
    return !!event;
  }
);

export const isProposalGroupJoinedByMe = rule()(
  async (
    _parent,
    { voteData }: { voteData: CreateVoteInput },
    { user, services: { groupsService, proposalsService } }: Context
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    const { group } = await proposalsService.getProposal(voteData.proposalId, [
      "group",
    ]);
    if (group) {
      const isJoinedByUser = await groupsService.isGroupMember(
        group.id,
        user.id
      );
      if (!isJoinedByUser) {
        return "You must be a group member to vote on this proposal";
      }
    }
    return true;
  }
);
