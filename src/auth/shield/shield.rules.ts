import { rule } from "graphql-shield";
import { Context } from "../../context/context.service";
import { Event } from "../../events/models/event.model";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";
import { hasServerPermission } from "./shield.utils";

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
