import { AvatarProps } from '@mui/material';
import { EventAvatarFragment } from '../../graphql/events/fragments/gen/EventAvatar.gen';
import { ProposalActionEventAvatarFragment } from '../../graphql/proposals/fragments/gen/ProposalActionEventAvatar.gen';
import { getEventPath } from '../../utils/event.utils';
import LazyLoadImage from '../Images/LazyLoadImage';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
  event: EventAvatarFragment | ProposalActionEventAvatarFragment;
  withLink?: boolean;
  size?: number;
}

const EventAvatar = ({ event, withLink, size, sx, ...avatarProps }: Props) => {
  const eventPagePath = getEventPath(event.id);

  const avatarStyles = {
    borderRadius: '50%',
    width: 40,
    height: 40,
    ...(size ? { width: size, height: size } : {}),
    ...sx,
  };

  const renderAvatar = () => (
    <Flex sx={avatarStyles} {...avatarProps}>
      <LazyLoadImage
        imageId={event.coverPhoto?.id}
        alt={event.name}
        width="100%"
        height="100%"
        borderRadius="50%"
      />
    </Flex>
  );

  if (withLink) {
    return <Link href={eventPagePath}>{renderAvatar()}</Link>;
  }

  return renderAvatar();
};

export default EventAvatar;
