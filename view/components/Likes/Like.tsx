import { ThumbUp } from '@mui/icons-material';
import { Box, SxProps, Typography, useTheme } from '@mui/material';
import { VOTE_BADGE_STYLES } from '../../constants/vote.constants';
import { LikeFragment } from '../../graphql/likes/fragments/gen/Like.gen';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';
import FollowButton from '../Users/FollowButton';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  like: LikeFragment;
  currentUserId?: number;
}

const Like = ({ like: { user }, currentUserId }: Props) => {
  const theme = useTheme();

  const isMe = user.id === currentUserId;
  const userProfilePath = getUserProfilePath(user.name);

  const flexStyles: SxProps = {
    marginBottom: '15px',
    justifyContent: 'space-between',
    '&:last-child': {
      marginBottom: 0,
    },
  };

  const iconContainerStyles: SxProps = {
    ...VOTE_BADGE_STYLES,
    border: `2px solid ${theme.palette.background.paper}`,
    height: 23,
    width: 23,
    position: 'absolute',
    top: 22,
    left: 23,
  };

  const iconStyles: SxProps = {
    fontSize: 10,
    marginTop: 0.5,
    color: 'text.primary',
  };

  return (
    <Flex sx={flexStyles}>
      <Link href={userProfilePath}>
        <Flex>
          <Box position="relative">
            <UserAvatar user={user} sx={{ marginRight: 1.5 }} />

            <Box sx={iconContainerStyles}>
              <ThumbUp sx={iconStyles} />
            </Box>
          </Box>
          <Typography sx={{ marginTop: 1 }}>{user.name}</Typography>
        </Flex>
      </Link>

      {currentUserId && !isMe && (
        <FollowButton user={user} currentUserId={currentUserId} />
      )}
    </Flex>
  );
};

export default Like;
