import { VoteTypes } from '../constants/vote.constants';
import { ProposalVoteBadgesFragment } from '../graphql/proposals/fragments/gen/ProposalVoteBadges.gen';
import { QuestionnaireTicketVoteBadgesFragment } from '../graphql/questions/fragments/gen/QuestionnaireTicketVoteBadges.gen';

export const filterVotesByType = (
  votes: (
    | ProposalVoteBadgesFragment
    | QuestionnaireTicketVoteBadgesFragment
  )['votes'],
) => {
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
