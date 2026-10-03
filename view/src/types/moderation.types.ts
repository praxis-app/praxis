import { type ImageRes } from './image.types';

export interface ModerationReasonReq {
  reason?: string;
}

export interface InstanceUserRes {
  id: string;
  name: string;
  displayName: string | null;
  anonymous: boolean;
  locked: boolean;
  deletedAt: string | null;
  profilePicture: ImageRes | null;
  createdAt: string;
}

export interface InstanceUsersRes {
  users: InstanceUserRes[];
  nextCursor: string | null;
  hasMore: boolean;
}
