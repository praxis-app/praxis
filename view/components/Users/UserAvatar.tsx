import { Avatar, AvatarProps, useTheme } from '@mui/material';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatarFragment } from '../../graphql/users/fragments/gen/UserAvatar.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { useImageSrc } from '../../hooks/image.hooks';
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
  const profilePicture = user?.profilePicture || me?.profilePicture;
  const src = useImageSrc(profilePicture?.id);

  const userName = user?.name || me?.name;
  const userProfilePath = getUserProfilePath(userName);

  const avatarStyles = {
    backgroundColor: theme.palette.background.paper,
    ...sx,
    ...(size ? { width: size, height: size } : {}),
  };

  const getAvatarSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return src;
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
