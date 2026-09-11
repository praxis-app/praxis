import { type CallArtifactRes } from './call.types';
import { type MessageRes } from './message.types';
import { type PollRes } from './poll.types';
import { type ProposalForumReferenceRes } from './forum.types';

export interface ChannelRes {
  id: string;
  name: string;
  description: string | null;
  channelType?: 'text' | 'forum';
  server?: {
    id: string;
    slug: string;
  };
}

export interface CreateChannelReq {
  name: string;
  description?: string;
  channelType: 'text' | 'forum';
}

export interface UpdateChannelReq {
  name: string;
  description?: string;
}

export interface UpdateChannelOrderReq {
  channelIds: string[];
}

export interface UnreadChannelsRes {
  channelIds: string[];
}

export type FeedItemRes =
  | (MessageRes & { type: 'message' })
  | (PollRes & { type: 'poll' })
  | (ProposalForumReferenceRes & { type: 'proposalMoved' })
  | CallArtifactRes;

export interface FeedQueryPage {
  feed: FeedItemRes[];
  startCursor?: string;
  nextCursor?: string;
  hasMore?: boolean;
}

export interface FeedQuery {
  pages: FeedQueryPage[];
  pageParams: (string | null)[];
}

export interface FeedPageRes {
  feed: FeedItemRes[];
  startCursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  hasMoreNewer: boolean;
}
