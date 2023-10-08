import { VoteBadgesFragment } from '../apollo/votes/generated/VoteBadges.fragment';
import { VoteTypes } from '../constants/vote.constants';

export const filterVotesByType = (votes: VoteBadgesFragment['votes']) => {
  const agreements = votes.filter(
    (vote) => vote.voteType === VoteTypes.Agreement,
  );
  const reservations = votes.filter(
    (vote) => vote.voteType === VoteTypes.Reservations,
  );
  const standAsides = votes.filter(
    (vote) => vote.voteType === VoteTypes.StandAside,
  );
  const blocks = votes.filter((vote) => vote.voteType === VoteTypes.Block);

  return { agreements, reservations, standAsides, blocks };
};
