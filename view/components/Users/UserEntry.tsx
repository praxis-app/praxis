import { Box, SxProps, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { UserEntryFragment } from '../../graphql/users/fragments/gen/UserEntry.gen';
import { useDeleteUserMutation } from '../../graphql/users/mutations/gen/DeleteUser.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { logOutUser } from '../../utils/auth.utils';
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
  const [deleteUser] = useDeleteUserMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const { id, name, isVerified } = user;
  const isMe = id === currentUserId;
  const userProfilePath = getUserProfilePath(name);
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
      variables: { id, isMe },
      update: removeUser(id),
      onCompleted() {
        if (isMe) {
          logOutUser();
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
          <Box>
            <Typography
              display="inline-block"
              overflow="hidden"
              textOverflow="ellipsis"
              title={name}
              whiteSpace="nowrap"
              width={isDesktop ? '300px' : '120px'}
            >
              {name}
            </Typography>

            <Typography
              color={isVerified ? 'text.secondary' : 'warning.light'}
              fontSize="13px"
              lineHeight={1}
              marginTop={-0.8}
            >
              {isVerified
                ? t('users.labels.verified')
                : t('users.labels.unverified')}
            </Typography>
          </Box>
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
