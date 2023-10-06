import { PanTool, ThumbDown, ThumbsUpDown, ThumbUp } from '@mui/icons-material';
import {
  Box,
  SvgIconProps,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { VoteFragment } from '../../apollo/votes/generated/Vote.fragment';
import { VoteTypes } from '../../constants/vote.constants';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import { BASE_BADGE_STYLES } from './VoteBadge';

interface Props {
  vote: VoteFragment;
}

const Vote = ({ vote: { user, voteType } }: Props) => {
  const theme = useTheme();

  const userProfilePath = getUserProfilePath(user.name);

  const voteBadgeStyles: SxProps = {
    ...BASE_BADGE_STYLES,
    border: `2px solid ${theme.palette.background.paper}`,
    height: 20,
    width: 20,
    position: 'absolute',
    top: 25,
    left: 26,
  };

  const renderVoteIcon = () => {
    const sx: SxProps = {
      fontSize: 8,
      marginTop: 0.5,
      transform: voteType === VoteTypes.Block ? 'translateX(-0.5px)' : null,
    };
    const iconProps: SvgIconProps = {
      color: 'primary',
      sx,
    };
    if (voteType === VoteTypes.Reservations) {
      return <ThumbsUpDown {...iconProps} />;
    }
    if (voteType === VoteTypes.StandAside) {
      return <ThumbDown {...iconProps} />;
    }
    if (voteType === VoteTypes.Block) {
      return <PanTool {...iconProps} />;
    }
    return <ThumbUp {...iconProps} />;
  };

  return (
    <Link href={userProfilePath}>
      <Flex>
        <Box position="relative" marginRight={2.5}>
          <UserAvatar user={user} />

          <Box sx={voteBadgeStyles}>{renderVoteIcon()}</Box>
        </Box>

        <Typography marginTop={1}>{user.name}</Typography>
      </Flex>
    </Link>
  );
};

export default Vote;
