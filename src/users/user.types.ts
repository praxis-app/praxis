import { User } from "./models/user.model";

export interface UserPermissions {
  serverPermissions: Set<string>;
  groupPermissions: Record<number, Set<string>>;
}

export type UserWithFollowerCount = User & { followerCount: number };
export type UserWithFollowingCount = User & { followingCount: number };
