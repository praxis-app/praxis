import { styled, Typography } from '@mui/material';
import { GroupMemberFragment } from '../../apollo/groups/generated/GroupMember.fragment';
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

const GroupMember = ({ member, currentUserId }: Props) => (
  <Flex sx={{ justifyContent: 'space-between' }}>
    <Link href={getUserProfilePath(member.name)}>
      <Flex>
        <UserAvatar user={member} sx={{ marginRight: 1.5 }} />
        <Typography sx={{ marginTop: 1 }}>{member.name}</Typography>
      </Flex>
    </Link>

    {currentUserId !== member.id && (
      <FollowButton user={member} currentUserId={currentUserId} />
    )}
  </Flex>
);

export default GroupMember;
