import { styled, Typography } from '@mui/material';
import { truncate } from 'lodash';
import { TruncationSizes } from '../../constants/shared.constants';
import { FollowFragment } from '../../graphql/users/fragments/gen/Follow.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
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
  const isDesktop = useIsDesktop();

  const isMe = user.id === currentUserId;
  const userProfilePath = getUserProfilePath(user.name);

  const username = user.displayName || user.name;
  const truncatedUsername = truncate(username, {
    length: isDesktop ? TruncationSizes.Medium : 22,
  });

  return (
    <StyledFlex>
      <Link href={userProfilePath}>
        <Flex>
          <UserAvatar user={user} sx={{ marginRight: 1.5 }} />
          <Typography sx={{ marginTop: 1 }}>{truncatedUsername}</Typography>
        </Flex>
      </Link>

      {!isMe && <FollowButton user={user} currentUserId={currentUserId} />}
    </StyledFlex>
  );
};

export default Follow;
