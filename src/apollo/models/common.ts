import {
  Comment,
  Group,
  GroupMember,
  Follow,
  Image,
  Like,
  Role,
  RoleMember,
  ServerInvite,
  Setting,
  User,
  Vote,
  Event,
  EventAttendee,
} from ".prisma/client";
import { BackendMotion } from "./motion";
import { BackendPost } from "./post";

export type BackendFeedItem = BackendMotion | BackendPost;

export type BackendItem =
  | BackendFeedItem
  | Comment
  | Event
  | EventAttendee
  | Follow
  | Group
  | GroupMember
  | Image
  | Like
  | Role
  | RoleMember
  | ServerInvite
  | Setting
  | User
  | Vote;

export const paginate = (
  totalItems: BackendItem[],
  currentPage: number,
  pageSize: number
): BackendItem[] => {
  let items = sortByNewest(totalItems);

  if (currentPage > 0)
    items = items.slice(currentPage * pageSize, items.length);

  return items.slice(0, pageSize);
};

export const sortByCreatedAt = (items: BackendItem[]): BackendItem[] =>
  items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

export const sortByNewest = (items: BackendItem[]): BackendItem[] =>
  sortByCreatedAt(items).reverse();
