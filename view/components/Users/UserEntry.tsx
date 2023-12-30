import { SxProps, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LocalStorageKey,
  NavigationPaths,
} from '../../constants/shared.constants';
import { isAuthLoadingVar, isLoggedInVar, toastVar } from '../../graphql/cache';
import { UserEntryFragment } from '../../graphql/users/fragments/gen/UserEntry.gen';
import { useDeleteUserMutation } from '../../graphql/users/mutations/gen/DeleteUser.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { removeUser } from '../../utils/cache.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import FollowButton from './FollowButton';
import UserAvatar from './UserAvatar';

interface Props {
  user: UserEntryFragment;
  currentUserId: number;
  canRemoveMembers: boolean;
}

const UserEntry = ({ user, currentUserId, canRemoveMembers }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteUser, { client }] = useDeleteUserMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const isMe = user.id === currentUserId;
  const userProfilePath = getUserProfilePath(user.name);
  const editUserPath = `${userProfilePath}${NavigationPaths.Edit}`;

  const deletePrompt = isMe
    ? t('users.prompts.removeSelf')
    : t('users.prompts.removeUser');

  const flexStyles: SxProps = {
    marginBottom: '15px',
    justifyContent: 'space-between',
    '&:last-child': {
      marginBottom: 0,
    },
  };

  const handleDelete = async () => {
    if (isMe) {
      navigate(NavigationPaths.Home);
    }
    await deleteUser({
      variables: { id: user.id, isMe },
      update: removeUser(user.id),
      onCompleted() {
        if (isMe) {
          isLoggedInVar(false);
          isAuthLoadingVar(false);
          localStorage.removeItem(LocalStorageKey.AccessToken);
          client.cache.reset();
        }
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
    <Flex sx={flexStyles}>
      <Link href={userProfilePath}>
        <Flex>
          <UserAvatar user={user} sx={{ marginRight: 1.5 }} />
          <Typography
            display="inline-block"
            marginTop={1}
            overflow="hidden"
            textOverflow="ellipsis"
            title={user.name}
            whiteSpace="nowrap"
            width={isDesktop ? '300px' : '120px'}
          >
            {user.name}
          </Typography>
        </Flex>
      </Link>

      <Flex gap="5px">
        {!isMe && <FollowButton user={user} currentUserId={currentUserId} />}

        <ItemMenu
          anchorEl={menuAnchorEl}
          canDelete={isMe || canRemoveMembers}
          canUpdate={isMe}
          deleteItem={handleDelete}
          deletePrompt={deletePrompt}
          editPath={editUserPath}
          setAnchorEl={setMenuAnchorEl}
        />
      </Flex>
    </Flex>
  );
};

export default UserEntry;
