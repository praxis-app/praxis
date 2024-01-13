import { VoteBadgesFragment } from '../graphql/votes/fragments/gen/VoteBadges.gen';
import { VoteTypes } from '../constants/vote.constants';

export const filterVotesByType = (votes: VoteBadgesFragment['votes']) => {
  const agreements = votes.filter(
    (vote) => vote.voteType === VoteTypes.Agreement,
  );
  const disagreements = votes.filter(
    (vote) => vote.voteType === VoteTypes.Disagreement,
  );
  const reservations = votes.filter(
    (vote) => vote.voteType === VoteTypes.Reservations,
  );
  const standAsides = votes.filter(
    (vote) => vote.voteType === VoteTypes.StandAside,
  );
  const blocks = votes.filter((vote) => vote.voteType === VoteTypes.Block);

  return { agreements, disagreements, reservations, standAsides, blocks };
};
