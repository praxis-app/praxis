import { Vote } from "./models/vote.model";
import { VoteType } from "./votes.constants";

interface SortedConsensusVotes {
  agreements: Vote[];
  reservations: Vote[];
  standAsides: Vote[];
  blocks: Vote[];
}

export const sortConsensusVotesByType = (votes: Vote[]) =>
  votes.reduce<SortedConsensusVotes>(
    (result, vote) => {
      if (vote.voteType === VoteType.Agreement) {
        result.agreements.push(vote);
      }
      if (vote.voteType === VoteType.Reservations) {
        result.reservations.push(vote);
      }
      if (vote.voteType === VoteType.StandAside) {
        result.standAsides.push(vote);
      }
      if (vote.voteType === VoteType.Block) {
        result.blocks.push(vote);
      }
      return result;
    },
    {
      agreements: [],
      reservations: [],
      standAsides: [],
      blocks: [],
    }
  );
