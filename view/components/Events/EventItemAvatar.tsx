import { Box, SxProps, useTheme } from '@mui/material';
import { EventAvatarFragment } from '../../apollo/events/generated/EventAvatar.fragment';
import { UserAvatarFragment } from '../../apollo/users/generated/UserAvatar.fragment';
import UserAvatar from '../Users/UserAvatar';
import EventAvatar from './EventAvatar';

interface Props {
  event: EventAvatarFragment;
  user: UserAvatarFragment;
}

const EventItemAvatar = ({ user, event }: Props) => {
  const theme = useTheme();

  const avatarStyles: SxProps = {
    border: `2px solid ${theme.palette.background.paper}`,
    position: 'absolute',
    top: 18.5,
    left: 22,
  };

  return (
    <Box position="relative" marginRight={0.25}>
      <EventAvatar event={event} withLink />
      <UserAvatar sx={avatarStyles} size={24} user={user} withLink />
    </Box>
  );
};

export default EventItemAvatar;
