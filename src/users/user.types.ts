import { GroupPermissionsMap } from "../groups/group-roles/models/group-role-permission.model";
import { ServerPermissions } from "../server-roles/models/server-permissions.type";
import { User } from "./models/user.model";

export interface UserPermissions {
  serverPermissions: ServerPermissions;
  groupPermissions: GroupPermissionsMap;
}

export type UserWithFollowerCount = User & { followerCount: number };
export type UserWithFollowingCount = User & { followingCount: number };
