// TODO: Determine whether to split RoleMember between server and group

import { ApolloCache, ApolloError, Reference } from '@apollo/client';
import { RemoveCircle } from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toastVar } from '../../graphql/cache';
import { useDeleteGroupRoleMemberMutation } from '../../graphql/groups/mutations/gen/DeleteGroupRoleMember.gen';
import { RoleMemberFragment } from '../../graphql/roles/fragments/gen/RoleMember.gen';
import {
  DeleteServerRoleMemberMutation,
  useDeleteServerRoleMemberMutation,
} from '../../graphql/roles/mutations/gen/DeleteServerRoleMember.gen';
import { FORBIDDEN, NavigationPaths } from '../../constants/shared.constants';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

const OuterFlex = styled(Flex)(() => ({
  marginBottom: 12,
  '&:last-child': {
    marginBottom: 0,
  },
}));

type AvailableUsersToAdd =
  DeleteServerRoleMemberMutation['deleteServerRoleMember']['serverRole']['availableUsersToAdd'];

interface Props {
  roleMember: RoleMemberFragment;
  roleId: number;
}

const RoleMember = ({ roleMember, roleId }: Props) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const isGroupRole = pathname.includes(NavigationPaths.Groups);
  const userProfilePath = getUserProfilePath(roleMember.name);

  const [deleteServerRoleMember, { loading: deleteServerRoleMemberLoading }] =
    useDeleteServerRoleMemberMutation();
  const [deleteGroupRoleMember, { loading: deleteGroupRoleMemberLoading }] =
    useDeleteGroupRoleMemberMutation();

  const isLoading =
    deleteServerRoleMemberLoading || deleteGroupRoleMemberLoading;

  const updateCache = (
    cache: ApolloCache<any>,
    availableUsersToAdd: AvailableUsersToAdd,
    __typename?: string,
  ) => {
    cache.modify({
      id: cache.identify({ id: roleId, __typename }),
      fields: {
        members(existingRefs: Reference[], { readField }) {
          return existingRefs.filter(
            (ref) => readField('id', ref) !== roleMember.id,
          );
        },
        availableUsersToAdd(_, { toReference }) {
          return availableUsersToAdd.map((user) => toReference(user));
        },
        memberCount(existingCount: number) {
          return Math.max(0, existingCount - 1);
        },
      },
    });
  };

  const handleError = (error: ApolloError) =>
    toastVar({
      status: 'error',
      title:
        error.message === FORBIDDEN
          ? t('prompts.permissionDenied')
          : error.message,
    });

  const handleDeleteServerRoleMember = async () =>
    await deleteServerRoleMember({
      variables: {
        serverRoleMemberData: {
          userId: roleMember.id,
          serverRoleId: roleId,
        },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          deleteServerRoleMember: {
            serverRole: { availableUsersToAdd, __typename },
          },
        } = data;
        updateCache(cache, availableUsersToAdd, __typename);
      },
      onError: handleError,
    });

  const handleDeleteGroupRoleMember = async () =>
    await deleteGroupRoleMember({
      variables: {
        groupRoleMemberData: {
          userId: roleMember.id,
          groupRoleId: roleId,
        },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          deleteGroupRoleMember: {
            groupRole: { availableUsersToAdd, __typename },
          },
        } = data;
        updateCache(cache, availableUsersToAdd, __typename);
      },
      onError: handleError,
    });

  const handleDelete = async () => {
    if (isGroupRole) {
      await handleDeleteGroupRoleMember();
      return;
    }
    await handleDeleteServerRoleMember();
  };

  const handleClickWithConfirm = () =>
    window.confirm(t('prompts.removeItem', { itemType: 'role member' })) &&
    handleDelete();

  return (
    <OuterFlex justifyContent="space-between">
      <Link href={userProfilePath}>
        <Flex>
          <UserAvatar user={roleMember} sx={{ marginRight: 1.5 }} />
          <Typography color="primary" sx={{ marginTop: 1 }}>
            {roleMember.displayName || roleMember.name}
          </Typography>
        </Flex>
      </Link>

      {isLoading ? (
        <CircularProgress
          size={12}
          sx={{ alignSelf: 'center', margin: '14px' }}
        />
      ) : (
        <IconButton onClick={handleClickWithConfirm}>
          <RemoveCircle />
        </IconButton>
      )}
    </OuterFlex>
  );
};

export default RoleMember;
