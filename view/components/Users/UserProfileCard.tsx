import { useReactiveVar } from '@apollo/client';
import { DateRange as JoinDateIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardHeader,
  CardProps,
  CardContent as MuiCardContent,
  SxProps,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LocalStorageKey,
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '../../constants/shared.constants';
import {
  isAuthLoadingVar,
  isLoggedInVar,
  isVerifiedVar,
  toastVar,
} from '../../graphql/cache';
import { UserProfileCardFragment } from '../../graphql/users/fragments/gen/UserProfileCard.gen';
import { useDeleteUserMutation } from '../../graphql/users/mutations/gen/DeleteUser.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { removeUser } from '../../utils/cache.utils';
import { urlifyText } from '../../utils/shared.utils';
import { formatDate } from '../../utils/time.utils';
import CoverPhoto from '../Images/CoverPhoto';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import FollowButton from './FollowButton';
import UserAvatar from './UserAvatar';

const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: 0,
  '&:last-child': {
    paddingBottom: 15,
  },
}));

const USER_NAME_STYLES: SxProps = {
  fontSize: 25,
  lineHeight: 1,
  marginBottom: 1.25,
};
const JOIN_DATE_STYLES: SxProps = {
  marginBottom: 1.4,
  marginLeft: -0.2,
};
const JOIN_DATE_ICON_STYLES: SxProps = {
  marginBottom: -0.5,
  marginRight: '0.3ch',
};

interface Props extends CardProps {
  user: UserProfileCardFragment;
  canRemoveMembers?: boolean;
}

const UserProfileCard = ({ user, canRemoveMembers, ...cardProps }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [deleteUser, { client }] = useDeleteUserMutation();
  const { data } = useMeQuery();

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    id,
    bio,
    coverPhoto,
    createdAt,
    followerCount,
    followingCount,
    name,
  } = user;
  const me = data && data.me;
  const isMe = me?.id === id;

  const deletePrompt = isMe
    ? t('users.prompts.removeSelf')
    : t('users.prompts.removeUser');

  const editUserPath = `${pathname}${NavigationPaths.Edit}`;
  const followersPath = `${pathname}${NavigationPaths.Followers}`;
  const followingPath = `${pathname}${NavigationPaths.Following}`;
  const joinDate = formatDate(createdAt);

  const avatarStyles: SxProps = {
    border: `4px solid ${theme.palette.background.paper}`,
    marginBottom: 1.25,
    marginLeft: -0.25,
    marginTop: isDesktop ? -10.5 : -7,
    zIndex: 1,
  };

  const handleDelete = async () => {
    navigate(NavigationPaths.Home);
    await deleteUser({
      variables: { id, isMe },
      update: removeUser(id),
      onCompleted() {
        if (!isMe) {
          return;
        }
        isLoggedInVar(false);
        isAuthLoadingVar(false);
        isVerifiedVar(false);
        localStorage.removeItem(LocalStorageKey.AccessToken);
        client.cache.reset();
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('users.errors.remove'),
        });
      },
    });
  };

  return (
    <Card {...cardProps}>
      <CoverPhoto imageId={coverPhoto?.id} topRounded />

      <CardHeader
        action={
          <>
            {me && !isMe && <FollowButton user={user} currentUserId={me.id} />}

            {(isMe || canRemoveMembers) && (
              <ItemMenu
                anchorEl={menuAnchorEl}
                canDelete={isMe || canRemoveMembers}
                canUpdate={isMe}
                deleteItem={handleDelete}
                deletePrompt={deletePrompt}
                editPath={editUserPath}
                setAnchorEl={setMenuAnchorEl}
              />
            )}
          </>
        }
        avatar={
          <UserAvatar
            size={isDesktop ? 150 : 90}
            sx={avatarStyles}
            user={user}
          />
        }
        sx={{ paddingBottom: 0 }}
      />

      <CardContent>
        <Typography color="primary" sx={USER_NAME_STYLES}>
          {name}
        </Typography>

        {bio && (
          <Typography
            dangerouslySetInnerHTML={{ __html: urlifyText(bio) }}
            whiteSpace="pre-wrap"
            marginBottom={1.4}
          />
        )}

        <Typography sx={JOIN_DATE_STYLES}>
          <JoinDateIcon fontSize="small" sx={JOIN_DATE_ICON_STYLES} />
          {t('users.profile.joinDate', { joinDate })}
        </Typography>

        {isVerified && (
          <Box>
            <Link href={followersPath}>
              {t('users.labels.followers', { count: followerCount })}
            </Link>
            {MIDDOT_WITH_SPACES}
            <Link href={followingPath}>
              {t('users.labels.following', { count: followingCount })}
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
