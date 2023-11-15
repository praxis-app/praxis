import { Avatar, AvatarProps, useTheme } from '@mui/material';
import { EventAvatarFragment } from '../../graphql/events/fragments/gen/EventAvatar.gen';
import { ProposalActionEventAvatarFragment } from '../../graphql/proposals/fragments/gen/ProposalActionEventAvatar.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { getEventPath } from '../../utils/event.utils';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
  event: EventAvatarFragment | ProposalActionEventAvatarFragment;
  withLink?: boolean;
  size?: number;
}

const EventAvatar = ({ event, withLink, size, sx, ...avatarProps }: Props) => {
  const theme = useTheme();
  const src = useImageSrc(event.coverPhoto?.id);
  const eventPagePath = getEventPath(event.id);

  const avatarStyles = {
    backgroundColor: theme.palette.background.paper,
    ...(size ? { width: size, height: size } : {}),
    ...sx,
  };

  const renderAvatar = () => (
    <Avatar alt={event.name} src={src} sx={avatarStyles} {...avatarProps} />
  );

  if (withLink) {
    <Link href={eventPagePath}>{renderAvatar()}</Link>;
  }

  return renderAvatar();
};

export default EventAvatar;
