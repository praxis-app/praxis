import { rule } from "graphql-shield";
import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../common/common.types";
import {
  GroupPermissions,
  ServerPermissions,
} from "../../roles/permissions/permissions.constants";
import { CreateVoteInput } from "../../votes/models/create-vote.input";
import { getJti, getSub } from "../auth.utils";
import { hasPermission } from "./shield.utils";

export const canCreateInvites = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasPermission(permissions, ServerPermissions.CreateInvites)
);

export const canManageInvites = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasPermission(permissions, ServerPermissions.ManageInvites)
);

export const canManagePosts = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasPermission(permissions, ServerPermissions.ManagePosts)
);

export const canManageServerRoles = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasPermission(permissions, ServerPermissions.ManageRoles)
);

export const canBanMembers = rule()(
  async (_parent, _args, { permissions }: Context) =>
    hasPermission(permissions, ServerPermissions.BanMembers)
);

export const canApproveGroupMemberRequests = rule()(
  async (
    _parent,
    args,
    {
      permissions,
      services: { memberRequestsService, groupsService },
    }: Context,
    info
  ) => {
    let groupId: number | undefined;

    if (info.fieldName === "approveMemberRequest") {
      const memberRequest = await memberRequestsService.getMemberRequest(
        { id: args.id },
        ["group"]
      );
      groupId = memberRequest?.group.id;
    }

    if (info.fieldName === "memberRequests") {
      const group = await groupsService.getGroup({ name: args.groupName });
      groupId = group.id;
    }

    return hasPermission(
      permissions,
      GroupPermissions.ApproveMemberRequests,
      groupId
    );
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
      const isJoinedByUser = await groupsService.isJoinedByUser(
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
