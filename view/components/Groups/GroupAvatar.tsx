import { Avatar, AvatarProps, CircularProgress } from '@mui/material';
import { GroupAvatarFragment } from '../../graphql/groups/fragments/gen/GroupAvatar.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { DarkMode } from '../../styles/theme';
import { getGroupPath } from '../../utils/group.utils';
import Center from '../Shared/Center';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
  group: GroupAvatarFragment;
}

const GroupAvatar = ({ group }: Props) => {
  const src = useImageSrc(group.coverPhoto?.id);
  const groupPagePath = getGroupPath(group.name);

  return (
    <Link href={groupPagePath}>
      <Avatar src={src} alt={group.name}>
        <Center bgcolor={DarkMode.PhantomShip} width="100%" height="100%">
          <CircularProgress size={10} sx={{ alignSelf: 'center' }} />
        </Center>
      </Avatar>
    </Link>
  );
};

export default GroupAvatar;
