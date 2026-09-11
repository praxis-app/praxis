import { type PollType } from '@/types/poll.types';

export interface ActiveDecisionRes {
  id: string;
  pollType: PollType;
  body?: string;
  closingAt?: string;
  responseCount: number;
  memberCount: number;
  hasResponded: boolean;
  createdAt: string;
  channelId: string;
  channelName: string;
  channelType: 'text' | 'forum';
  forumPostId?: string;
}

export interface ActiveDecisionsRes {
  decisions: ActiveDecisionRes[];
  nextCursor: string | null;
  hasMore: boolean;
}
