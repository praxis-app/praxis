import { Avatar, AvatarProps, useTheme } from '@mui/material';
import { getEventPath } from '../../../utils/event.utils';
import { getImagePath } from '../../../utils/image.utils';
import Link from '../../Shared/Link';
import { EventAvatarFragment } from './graphql/generated/EventAvatar.fragment';
import { ProposalActionEventAvatarFragment } from './graphql/generated/ProposalActionEventAvatar.fragment';

interface Props extends AvatarProps {
  event: EventAvatarFragment | ProposalActionEventAvatarFragment;
  withLink?: boolean;
  size?: number;
}

const EventAvatar = ({ event, withLink, size, sx, ...avatarProps }: Props) => {
  const theme = useTheme();

  const eventPagePath = getEventPath(event.id);
  const imagePath = event.coverPhoto
    ? getImagePath(event.coverPhoto.id)
    : undefined;

  const avatarStyles = {
    backgroundColor: theme.palette.background.paper,
    ...(size ? { width: size, height: size } : {}),
    ...sx,
  };

  const renderAvatar = () => (
    <Avatar
      alt={event.name}
      src={imagePath}
      sx={avatarStyles}
      {...avatarProps}
    />
  );

  if (withLink) {
    <Link href={eventPagePath}>{renderAvatar()}</Link>;
  }

  return renderAvatar();
};

export default EventAvatar;
