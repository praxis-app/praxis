import {
  type CreatePollActionReq,
  type PollActionRes,
} from '@/types/poll-action.types';
import { type UserRes } from '@/types/user.types';
import { type ImageRes } from '@/types/image.types';
import { type VoteRes } from '@/types/vote.types';
import {
  DECISION_MAKING_MODEL,
  POLL_STAGE,
  POLL_TYPE,
} from '@/constants/poll.constants';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type PollStage = (typeof POLL_STAGE)[number];

export type PollClosedReason = 'event-start-elapsed' | 'event-host-ineligible';

export type PollType = (typeof POLL_TYPE)[number];

export interface PollRes {
  id: string;
  body: string;
  pollType: PollType;
  stage: PollStage;
  closedReason?: PollClosedReason;
  action?: PollActionRes;
  config: PollConfigRes;
  options?: PollOptionRes[];
  user: UserRes;
  votes: VoteRes[];
  images: ImageRes[];
  myVote?: VoteRes;
  agreementVoteCount: number;
  memberCount: number;
  sourceCallId?: string;
  sourceCallStatus?: string;
  replyCount: number;
  replyUsers?: UserRes[];
  latestReplyAt: string | null;
  createdAt: string;
}

export interface PollOptionRes {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollConfigRes {
  decisionMakingModel?: DecisionMakingModel;
  agreementThreshold?: number;
  quorumEnabled?: boolean;
  quorumThreshold?: number;
  disagreementsLimit?: number;
  abstainsLimit?: number;
  blocksOpenToAll?: boolean;
  closingAt?: string;
  multipleChoice?: boolean;
}

export interface CreatePollReq {
  body?: string;
  pollType: PollType;
  action?: CreatePollActionReq;
  options?: string[];
  multipleChoice?: boolean;
  closingAt?: string;
}
