import { rule } from "graphql-shield";
import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../context/context.service";
import { Event } from "../../events/models/event.model";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";
import { getJti, getSub } from "../auth.utils";
import { hasNodes, hasServerPermission } from "./shield.utils";

export const isAuthenticated = rule({ cache: "contextual" })(
  async (_parent, _args, { user }: Context) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return true;
  }
);

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

export const isUserInPublicPost = rule()(async (_parent, _args, _ctx, info) =>
  hasNodes(["publicPost", "user"], info.path)
);

export const isUserInPublicFeed = rule()(
  async (_parent, _args, _ctx, info) =>
    hasNodes(["publicGroupsFeed", "user"], info.path) ||
    hasNodes(["publicGroup", "feed", "user"], info.path)
);

export const isUserAvatarInPublicPost = rule()(
  async (_parent, _args, _ctx, info) =>
    hasNodes(["publicPost", "user", "profilePicture"], info.path)
);

export const isUserAvatarInPublicFeed = rule()(
  async (_parent, _args, _ctx, info) =>
    hasNodes(["publicGroupsFeed", "user", "profilePicture"], info.path) ||
    hasNodes(["publicGroup", "feed", "user", "profilePicture"], info.path)
);

export const isPublicEvent = rule()(
  async (
    parent: Event,
    args: { id: number },
    { services: { eventsService } }: Context
  ) => {
    const event = await eventsService.getEvent({
      id: parent ? parent.id : args.id,
      group: {
        config: { privacy: GroupPrivacy.Public },
      },
    });
    return !!event;
  }
);
