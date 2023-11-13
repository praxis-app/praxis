import { Avatar, AvatarProps } from '@mui/material';
import { GroupAvatarFragment } from '../../graphql/groups/fragments/gen/GroupAvatar.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { getGroupPath } from '../../utils/group.utils';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
  group: GroupAvatarFragment;
}

const GroupAvatar = ({ group }: Props) => {
  const src = useImageSrc(group.coverPhoto?.id);
  const groupPagePath = getGroupPath(group.name);

  return (
    <Link href={groupPagePath}>
      <Avatar src={src} alt={group.name} />
    </Link>
  );
};

export default GroupAvatar;
