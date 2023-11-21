import { LazyLoadImage } from 'react-lazy-load-image-component';
import { GroupAvatarFragment } from '../../graphql/groups/fragments/gen/GroupAvatar.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { getGroupPath } from '../../utils/group.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props {
  group: GroupAvatarFragment;
}

const GroupAvatar = ({ group }: Props) => {
  const src = useImageSrc(group.coverPhoto?.id);
  const groupPagePath = getGroupPath(group.name);

  return (
    <Link href={groupPagePath}>
      <Flex borderRadius="50%" width={40} height={40}>
        <LazyLoadImage
          src={src}
          alt={group.name}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          effect="blur"
          width="100%"
          height="100%"
        />
      </Flex>
    </Link>
  );
};

export default GroupAvatar;
