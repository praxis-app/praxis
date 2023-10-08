import { Avatar, AvatarProps } from '@mui/material';
import { GroupAvatarFragment } from '../../apollo/groups/generated/GroupAvatar.fragment';
import { getGroupPath } from '../../utils/group.utils';
import { getImagePath } from '../../utils/image.utils';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
  group: GroupAvatarFragment;
}

const GroupAvatar = ({ group }: Props) => {
  const groupPagePath = getGroupPath(group.name);
  const imagePath = group.coverPhoto
    ? getImagePath(group.coverPhoto.id)
    : undefined;

  return (
    <Link href={groupPagePath}>
      <Avatar src={imagePath} alt={group.name} />
    </Link>
  );
};

export default GroupAvatar;
