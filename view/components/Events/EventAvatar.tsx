import { AvatarProps } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { EventAvatarFragment } from '../../graphql/events/fragments/gen/EventAvatar.gen';
import { ProposalActionEventAvatarFragment } from '../../graphql/proposals/fragments/gen/ProposalActionEventAvatar.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { getEventPath } from '../../utils/event.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
  event: EventAvatarFragment | ProposalActionEventAvatarFragment;
  withLink?: boolean;
  size?: number;
}

const EventAvatar = ({ event, withLink, size, sx, ...avatarProps }: Props) => {
  const src = useImageSrc(event.coverPhoto?.id);
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
        src={src}
        alt={event.name}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
        effect="blur"
        width="100%"
        height="100%"
      />
    </Flex>
  );

  if (withLink) {
    return <Link href={eventPagePath}>{renderAvatar()}</Link>;
  }

  return renderAvatar();
};

export default EventAvatar;
