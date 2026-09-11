import { type VoteType } from '@/types/vote.types';

export interface WithVoteType {
  voteType: VoteType;
}

interface SortedConsensusVotes<T> {
  agreements: T[];
  disagreements: T[];
  abstains: T[];
  blocks: T[];
}

export const sortConsensusVotesByType = <T extends WithVoteType>(
  votes: T[],
): SortedConsensusVotes<T> =>
  votes.reduce<SortedConsensusVotes<T>>(
    (result, vote) => {
      if (vote.voteType === 'agree') {
        result.agreements.push(vote);
      }
      if (vote.voteType === 'disagree') {
        result.disagreements.push(vote);
      }
      if (vote.voteType === 'abstain') {
        result.abstains.push(vote);
      }
      if (vote.voteType === 'block') {
        result.blocks.push(vote);
      }
      return result;
    },
    {
      agreements: [],
      disagreements: [],
      abstains: [],
      blocks: [],
    },
  );
