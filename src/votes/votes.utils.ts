import { Vote } from './models/vote.model';
import { VoteTypes } from './votes.constants';

interface SortedConsensusVotes {
  agreements: Vote[];
  reservations: Vote[];
  standAsides: Vote[];
  blocks: Vote[];
}

export const sortConsensusVotesByType = (votes: Vote[]) =>
  votes.reduce<SortedConsensusVotes>(
    (result, vote) => {
      if (vote.voteType === VoteTypes.Agreement) {
        result.agreements.push(vote);
      }
      if (vote.voteType === VoteTypes.Reservations) {
        result.reservations.push(vote);
      }
      if (vote.voteType === VoteTypes.StandAside) {
        result.standAsides.push(vote);
      }
      if (vote.voteType === VoteTypes.Block) {
        result.blocks.push(vote);
      }
      return result;
    },
    {
      agreements: [],
      reservations: [],
      standAsides: [],
      blocks: [],
    },
  );
