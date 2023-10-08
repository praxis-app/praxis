import { styled, Typography } from '@mui/material';
import { FollowFragment } from '../../apollo/users/generated/Follow.fragment';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';
import FollowButton from './FollowButton';
import UserAvatar from './UserAvatar';

const StyledFlex = styled(Flex)(() => ({
  marginBottom: 15,
  justifyContent: 'space-between',
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Props {
  user: FollowFragment;
  currentUserId: number;
}

const Follow = ({ user, currentUserId }: Props) => {
  const isMe = user.id === currentUserId;
  const userProfilePath = getUserProfilePath(user.name);

  return (
    <StyledFlex>
      <Link href={userProfilePath}>
        <Flex>
          <UserAvatar user={user} sx={{ marginRight: 1.5 }} />
          <Typography sx={{ marginTop: 1 }}>{user.name}</Typography>
        </Flex>
      </Link>

      {!isMe && <FollowButton user={user} currentUserId={currentUserId} />}
    </StyledFlex>
  );
};

export default Follow;
