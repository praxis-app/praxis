import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../common/common.types";
import { CreateEventInput } from "../../events/models/create-event.input";
import { UpdateEventInput } from "../../events/models/update-event.input";
import { GroupPermissions } from "../../groups/group-roles/models/group-permissions.type";
import { ServerPermissions } from "../../server-roles/models/server-permissions.type";
import { UserPermissions } from "../../users/user.types";

export const hasServerPermission = (
  permissions: UserPermissions | null,
  permission: keyof ServerPermissions
) => {
  if (!permissions) {
    return UNAUTHORIZED;
  }
  const hasPermission = permissions.serverPermissions[permission];
  if (!hasPermission) {
    return false;
  }
  return true;
};

export const hasGroupPermission = (
  permissions: UserPermissions | null,
  permission: keyof GroupPermissions,
  groupId: number
) => {
  if (!permissions) {
    return UNAUTHORIZED;
  }
  const groupPermissions = permissions.groupPermissions[groupId];
  if (!groupPermissions || !groupPermissions[permission]) {
    return false;
  }
  return true;
};

export const getEventRuleGroupId = async (
  args: { eventData: CreateEventInput | UpdateEventInput } | { id: number },
  { services: { eventsService } }: Context
) => {
  let groupId: number | undefined;

  if ("eventData" in args) {
    if ("groupId" in args.eventData) {
      groupId = args.eventData.groupId;
    }
    if ("id" in args.eventData) {
      const event = await eventsService.getEvent({ id: args.eventData.id });
      groupId = event.groupId;
    }
  } else {
    const event = await eventsService.getEvent({ id: args.id });
    groupId = event.groupId;
  }

  return groupId;
};
