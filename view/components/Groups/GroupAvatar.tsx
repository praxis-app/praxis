import { SxProps } from '@mui/material';
import { GroupAvatarFragment } from '../../graphql/groups/fragments/gen/GroupAvatar.gen';
import { getGroupPath } from '../../utils/group.utils';
import LazyLoadImage from '../Images/LazyLoadImage';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props {
  group: GroupAvatarFragment;
  withLink?: boolean;
  sx?: SxProps;
  imageStyles?: SxProps;
}

const GroupAvatar = ({ group, sx, withLink = true, imageStyles }: Props) => {
  const groupPagePath = getGroupPath(group.name);

  const renderAvatar = () => (
    <Flex borderRadius="50%" width={40} height={40} sx={sx}>
      <LazyLoadImage
        imageId={group.coverPhoto?.id}
        alt={group.name}
        width="100%"
        height="100%"
        borderRadius="50%"
        sx={imageStyles}
      />
    </Flex>
  );

  if (!withLink) {
    return renderAvatar();
  }

  return <Link href={groupPagePath}>{renderAvatar()}</Link>;
};

export default GroupAvatar;
