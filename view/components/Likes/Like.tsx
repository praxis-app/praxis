import { SxProps, Typography } from '@mui/material';
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
  const isMe = user.id === currentUserId;
  const userProfilePath = getUserProfilePath(user.name);

  const flexStyles: SxProps = {
    marginBottom: '15px',
    justifyContent: 'space-between',
    '&:last-child': {
      marginBottom: 0,
    },
  };

  return (
    <Flex sx={flexStyles}>
      <Link href={userProfilePath}>
        <Flex>
          <UserAvatar user={user} sx={{ marginRight: 1.5 }} />
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
