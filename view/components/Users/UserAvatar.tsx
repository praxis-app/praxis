import { BoxProps, useTheme } from '@mui/material';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatarFragment } from '../../graphql/users/fragments/gen/UserAvatar.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { getUserProfilePath } from '../../utils/user.utils';
import LazyLoadImage from '../Images/LazyLoadImage';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props extends BoxProps {
  imageFile?: File;
  linkStyles?: CSSProperties;
  size?: number;
  user?: UserAvatarFragment;
  withLink?: boolean;
}

const UserAvatar = ({
  imageFile,
  linkStyles,
  size,
  sx,
  user,
  withLink,
  ...avatarProps
}: Props) => {
  const { data } = useMeQuery({ skip: !!user });
  const { t } = useTranslation();
  const theme = useTheme();

  const me = data && data.me;
  const profilePicture = user?.profilePicture || me?.profilePicture;
  const userName = user?.name || me?.name;
  const userProfilePath = getUserProfilePath(userName);

  const avatarStyles = {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50%',
    width: 40,
    height: 40,
    ...sx,
    ...(size ? { width: size, height: size } : {}),
  };

  const getImageFileSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
  };

  const renderAvatar = () => {
    return (
      <Flex sx={avatarStyles} {...avatarProps}>
        <LazyLoadImage
          alt={t('images.labels.profilePicture')}
          imageId={profilePicture?.id}
          src={getImageFileSrc()}
          borderRadius="50%"
          width="100%"
          height="100%"
        />
      </Flex>
    );
  };

  if (withLink) {
    return (
      <Link href={userProfilePath} sx={linkStyles}>
        {renderAvatar()}
      </Link>
    );
  }

  return renderAvatar();
};

export default UserAvatar;
