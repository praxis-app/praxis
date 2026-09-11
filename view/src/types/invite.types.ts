import { type UserRes } from './user.types';

export interface InviteRes {
  id: string;
  token: string;
  uses: number;
  maxUses?: number;
  user: UserRes;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateInviteReq {
  maxUses?: number;
  expiresAt?: Date;
}
