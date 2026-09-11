import { VOTE_TYPES } from '@/constants/vote.constants';
import { type PollClosedReason } from '@/types/poll.types';

export type VoteType = (typeof VOTE_TYPES)[number];

export interface VoteRes {
  id: string;
  voteType?: VoteType;
  pollOptionIds?: string[];
  blockIgnored?: boolean;
}

export interface CreateVoteRes {
  id: string;
  pollId: string;
  userId: string;
  voteType?: VoteType;
  pollOptionIds?: string[];
  isRatifyingVote: boolean;
  closedReason?: PollClosedReason;
}

export type UpdateVoteRes = {
  isRatifyingVote: boolean;
  closedReason?: PollClosedReason;
};

export interface PollOptionVoterRes {
  id: string;
  name: string;
  displayName?: string;
  profilePicture: { id: string } | null;
}

export interface CreateVoteReq {
  voteType?: VoteType;
  pollOptionIds?: string[];
}

export interface UpdateVoteReq {
  voteType?: VoteType;
  pollOptionIds?: string[];
}
