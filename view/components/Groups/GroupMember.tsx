import { styled, Typography } from '@mui/material';
import { truncate } from 'lodash';
import { TruncationSizes } from '../../constants/shared.constants';
import { GroupMemberFragment } from '../../graphql/groups/fragments/gen/GroupMember.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getUserProfilePath } from '../../utils/user.utils';
import SharedFlex from '../Shared/Flex';
import Link from '../Shared/Link';
import FollowButton from '../Users/FollowButton';
import UserAvatar from '../Users/UserAvatar';

const Flex = styled(SharedFlex)(() => ({
  marginBottom: 15,
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Props {
  member: GroupMemberFragment;
  currentUserId: number;
}

const GroupMember = ({ member, currentUserId }: Props) => {
  const isDesktop = useIsDesktop();

  const username = member.displayName || member.name;
  const truncatedUsername = truncate(username, {
    length: isDesktop ? TruncationSizes.Medium : 22,
  });

  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Link href={getUserProfilePath(member.name)}>
        <Flex>
          <UserAvatar user={member} sx={{ marginRight: 1.5 }} />
          <Typography sx={{ marginTop: 1 }}>{truncatedUsername}</Typography>
        </Flex>
      </Link>

      {currentUserId !== member.id && (
        <FollowButton user={member} currentUserId={currentUserId} />
      )}
    </Flex>
  );
};

export default GroupMember;
