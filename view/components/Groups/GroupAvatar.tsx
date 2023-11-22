import { GroupAvatarFragment } from '../../graphql/groups/fragments/gen/GroupAvatar.gen';
import { getGroupPath } from '../../utils/group.utils';
import LazyLoadImage from '../Images/LazyLoadImage';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props {
  group: GroupAvatarFragment;
}

const GroupAvatar = ({ group }: Props) => {
  const groupPagePath = getGroupPath(group.name);

  return (
    <Link href={groupPagePath}>
      <Flex borderRadius="50%" width={40} height={40}>
        <LazyLoadImage
          imageId={group.coverPhoto?.id}
          alt={group.name}
          width="100%"
          height="100%"
          borderRadius="50%"
        />
      </Flex>
    </Link>
  );
};

export default GroupAvatar;
