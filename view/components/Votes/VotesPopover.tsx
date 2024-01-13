import { PaperProps, Popover, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { VoteFragment } from '../../graphql/votes/fragments/gen/Vote.gen';
import { VoteTypes } from '../../constants/vote.constants';

interface Props {
  anchorEl: null | HTMLElement;
  handlePopoverClose(): void;
  votes: VoteFragment[];
  voteType: string;
}

const VotesPopover = ({
  anchorEl,
  handlePopoverClose,
  votes,
  voteType,
}: Props) => {
  const { t } = useTranslation();

  const paperProps: PaperProps = {
    sx: {
      paddingX: 1.75,
      paddingY: 1.25,
    },
  };

  const getVoteType = () => {
    if (voteType === VoteTypes.Reservations) {
      return t('votes.actions.reservations');
    }
    if (voteType === VoteTypes.StandAside) {
      return t('votes.actions.standAside');
    }
    if (voteType === VoteTypes.Block) {
      return t('votes.actions.block');
    }
    if (voteType === VoteTypes.Disagreement) {
      return t('votes.actions.disagree');
    }
    return t('votes.actions.agree');
  };

  return (
    <Popover
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      open={!!anchorEl}
      slotProps={{ paper: paperProps }}
      sx={{ pointerEvents: 'none' }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Typography color="primary" gutterBottom>
        {getVoteType()}
      </Typography>

      {votes.map(({ id, user }) => (
        <Typography key={id}>{user.name}</Typography>
      ))}
    </Popover>
  );
};

export default VotesPopover;
