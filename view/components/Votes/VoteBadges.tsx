import {
  PanTool as BlockIcon,
  ThumbDown as StandAsideIcon,
  ThumbsUpDown as ReservationsIcon,
  ThumbUp as AgreementIcon,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { VoteBadgesFragment } from '../../apollo/votes/generated/VoteBadges.fragment';
import { VoteTypes } from '../../constants/vote.constants';
import { filterVotesByType } from '../../utils/vote.utils';
import Flex from '../Shared/Flex';
import VoteBadge from './VoteBadge';
import VotesModal from './VotesModal';

interface Props {
  proposal: VoteBadgesFragment;
}

const VoteBadges = ({ proposal: { votes, voteCount } }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { agreements, reservations, standAsides, blocks } = useMemo(
    () => filterVotesByType(votes),
    [votes],
  );

  const agreementsBadge = {
    Icon: AgreementIcon,
    votes: agreements,
    voteType: VoteTypes.Agreement,
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

  const badges = [
    agreementsBadge,
    standAsidesBadge,
    reservationsBadge,
    blocksBadge,
  ]
    .filter((badge) => badge.votes.length)
    .sort((a, b) => b.votes.length - a.votes.length);

  const handleClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Flex sx={{ cursor: 'pointer', height: '24px' }} onClick={handleClick}>
        <Flex paddingRight={1}>
          {badges.map((badge, index) => (
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
