import { Box, useTheme } from '@mui/material';
import UserAvatar from '../Users/UserAvatar/UserAvatar';
import { UserAvatarFragment } from '../Users/UserAvatar/generated/UserAvatar.fragment';
import GroupAvatar from './GroupAvatar/GroupAvatar';
import { GroupAvatarFragment } from './GroupAvatar/generated/GroupAvatar.fragment';

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
