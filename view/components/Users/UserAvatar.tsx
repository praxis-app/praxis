import { BoxProps } from '@mui/material';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { UserAvatarFragment } from '../../graphql/users/fragments/gen/UserAvatar.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { getUserProfilePath } from '../../utils/user.utils';
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

  const me = data && data.me;
  const profilePicture = user?.profilePicture || me?.profilePicture;
  const src = useImageSrc(profilePicture?.id);

  const userName = user?.name || me?.name;
  const userProfilePath = getUserProfilePath(userName);

  const avatarStyles = {
    borderRadius: '50%',
    width: 40,
    height: 40,
    ...sx,
    ...(size ? { width: size, height: size } : {}),
  };

  const getAvatarSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return src;
  };

  const renderAvatar = () => {
    return (
      <Flex sx={avatarStyles} {...avatarProps}>
        <LazyLoadImage
          src={getAvatarSrc()}
          alt={t('images.labels.profilePicture')}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          effect="blur"
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
