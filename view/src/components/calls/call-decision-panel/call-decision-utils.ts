import { type PollRes } from '@/types/poll.types';

export const responseCount = (poll?: PollRes | null) => {
  if (!poll) {
    return null;
  }
  return `${poll.votes?.length ?? 0}/${poll.memberCount} responded`;
};

export const decisionTitle = (poll?: PollRes | null) => {
  if (!poll) {
    return '';
  }
  return poll.body || (poll.pollType === 'proposal' ? 'Proposal' : 'Poll');
};
