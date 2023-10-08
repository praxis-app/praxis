import { Avatar, AvatarProps, useTheme } from '@mui/material';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useMeQuery } from '../../apollo/users/generated/Me.query';
import { UserAvatarFragment } from '../../apollo/users/generated/UserAvatar.fragment';
import { getImagePath } from '../../utils/image.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import Link from '../Shared/Link';

interface Props extends AvatarProps {
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
  const userName = user?.name || me?.name;
  const userProfilePath = getUserProfilePath(userName);

  const avatarStyles = {
    backgroundColor: theme.palette.background.paper,
    ...sx,
    ...(size ? { width: size, height: size } : {}),
  };

  const _getImagePath = () => {
    if (user?.profilePicture) {
      return getImagePath(user.profilePicture.id);
    }
    if (me?.profilePicture) {
      return getImagePath(me.profilePicture.id);
    }
  };

  const getAvatarSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return _getImagePath();
  };

  // TODO: Show spinner for loading state
  const renderAvatar = () => (
    <Avatar
      alt={t('images.labels.profilePicture')}
      src={getAvatarSrc()}
      sx={avatarStyles}
      {...avatarProps}
    />
  );

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
