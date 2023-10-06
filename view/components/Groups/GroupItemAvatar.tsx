import { Box, useTheme } from '@mui/material';
import { GroupAvatarFragment } from '../../apollo/groups/generated/GroupAvatar.fragment';
import { UserAvatarFragment } from '../../apollo/users/generated/UserAvatar.fragment';
import UserAvatar from '../Users/UserAvatar';
import GroupAvatar from './GroupAvatar';

interface Props {
  group: GroupAvatarFragment;
  user: UserAvatarFragment;
}

const GroupItemAvatar = ({ user, group }: Props) => {
  const theme = useTheme();

  return (
    <Box position="relative" marginRight={0.25}>
      <GroupAvatar group={group} />
      <UserAvatar
        sx={{
          border: `2px solid ${theme.palette.background.paper}`,
          position: 'absolute',
          top: 18.5,
          left: 22,
        }}
        size={24}
        user={user}
        withLink
      />
    </Box>
  );
};

export default GroupItemAvatar;
