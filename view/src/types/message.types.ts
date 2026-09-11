import { type CommandStatus } from '@/types/command.types';
import { type ImageRes } from './image.types';
import { type UserRes } from './user.types';
import { type PollRes } from './poll.types';

export interface BotRes {
  id: string;
  name: string;
  displayName: string | null;
}

export interface MessageRes {
  id: string;
  body: string | null;
  images?: ImageRes[];
  user: UserRes | null;
  userId: string | null;
  botId: string | null;
  bot: BotRes | null;
  commandStatus?: CommandStatus | null;
  threadRootId?: string;
  threadPollId?: string;
  parentMessageId?: string;
  replyCount: number;
  replyUsers?: UserRes[];
  latestReplyAt: string | null;
  createdAt: string;
}

export interface CreateReplyReq {
  body?: string;
  parentMessageId?: string;
}

export interface ThreadCursor {
  before?: string;
  after?: string;
  around?: string;
}

export interface ThreadPageRes {
  root: MessageRes | PollRes;
  replies: MessageRes[];
  startCursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  hasMoreNewer: boolean;
}

export interface MovedThreadErrorRes {
  error: string;
  movedTo: {
    destinationChannelId: string;
    forumPostId: string;
  };
}

export type ThreadRootKind = 'message' | 'poll';

export interface ThreadIdentity {
  rootKind: ThreadRootKind;
  rootId: string;
}

export interface ThreadQuery {
  pages: ThreadPageRes[];
  pageParams: (string | null)[];
}
