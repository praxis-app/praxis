import {
  ThumbUp as AgreementIcon,
  PanTool as BlockIcon,
  ThumbsUpDown as ReservationsIcon,
  ThumbDown as StandAsideIcon,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { DecisionMakingModel } from '../../constants/proposal.constants';
import { VoteTypes } from '../../constants/vote.constants';
import { VoteBadgesFragment } from '../../graphql/votes/fragments/gen/VoteBadges.gen';
import { filterVotesByType } from '../../utils/vote.utils';
import Flex from '../Shared/Flex';
import VoteBadge from './VoteBadge';
import VotesModal from './VotesModal';

interface Props {
  proposal: VoteBadgesFragment;
}

const VoteBadges = ({ proposal: { votes, voteCount, settings } }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { agreements, disagreements, reservations, standAsides, blocks } =
    useMemo(() => filterVotesByType(votes), [votes]);

  const isMajorityVote =
    settings.decisionMakingModel === DecisionMakingModel.MajorityVote;

  const agreementsBadge = {
    Icon: AgreementIcon,
    votes: agreements,
    voteType: VoteTypes.Agreement,
  };
  const disagreementsBadge = {
    Icon: StandAsideIcon,
    votes: disagreements,
    voteType: VoteTypes.Disagreement,
  };
  const reservationsBadge = {
    Icon: ReservationsIcon,
    votes: reservations,
    voteType: VoteTypes.Reservations,
  };
  const standAsidesBadge = {
    Icon: StandAsideIcon,
    votes: standAsides,
    voteType: VoteTypes.StandAside,
  };
  const blocksBadge = {
    Icon: BlockIcon,
    votes: blocks,
    voteType: VoteTypes.Block,
  };

  const badges = isMajorityVote
    ? [agreementsBadge, disagreementsBadge]
    : [agreementsBadge, standAsidesBadge, reservationsBadge, blocksBadge];

  const filteredBadges = badges
    .filter((badge) => badge.votes.length)
    .sort((a, b) => b.votes.length - a.votes.length);

  const handleClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Flex sx={{ cursor: 'pointer', height: '24px' }} onClick={handleClick}>
        <Flex paddingRight={1}>
          {filteredBadges.map((badge, index) => (
            <VoteBadge
              {...badge}
              key={badge.voteType}
              sx={{ zIndex: badges.length - index }}
            />
          ))}
        </Flex>

        <Typography>{voteCount}</Typography>
      </Flex>

      <VotesModal
        allVotes={votes}
        agreements={agreements}
        disagreements={disagreements}
        blocks={blocks}
        open={isModalOpen}
        reservations={reservations}
        standAsides={standAsides}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default VoteBadges;
