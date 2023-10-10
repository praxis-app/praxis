import { ApolloCache, FetchResult, useReactiveVar } from '@apollo/client';
import { AccountBox, Settings } from '@mui/icons-material';
import {
  Box,
  Card,
  CardProps,
  MenuItem,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isLoggedInVar, toastVar } from '../../../apollo/cache';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
  TypeNames,
} from '../../../constants/shared.constants';
import {
  getEditGroupPath,
  getGroupMembersPath,
  getGroupPath,
  getMemberRequestsPath,
} from '../../../utils/group.utils';
import ItemMenu from '../../Shared/ItemMenu';
import Link from '../../Shared/Link';
import GroupAvatar from '../GroupAvatar/GroupAvatar';
import {
  DeleteGroupMutation,
  useDeleteGroupMutation,
} from '../GroupProfileCard/generated/DeleteGroup.mutation';
import {
  GroupsDocument,
  GroupsQuery,
} from '../GroupsList/generated/Groups.query';
import JoinButton from '../JoinButton/JoinButton';
import { GroupCardFragment } from './generated/GroupCard.fragment';

export const removeGroup =
  (id: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeleteGroupMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    cache.updateQuery<GroupsQuery>({ query: GroupsDocument }, (groupsData) =>
      produce(groupsData, (draft) => {
        if (!draft) {
          return;
        }
        const index = draft.groups.findIndex((p) => p.id === id);
        draft.groups.splice(index, 1);
      }),
    );
    const cacheId = cache.identify({ id, __typename: TypeNames.Group });
    cache.evict({ id: cacheId });
    cache.gc();
  };

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
}));

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

interface Props extends CardProps {
  currentUserId?: number;
  group: GroupCardFragment;
}

const GroupCard = ({ group, currentUserId, ...cardProps }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [deleteGroup] = useDeleteGroupMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    id,
    name,
    description,
    isJoinedByMe,
    memberCount,
    memberRequestCount,
    myPermissions,
  } = group;

  const canApproveMemberRequests = myPermissions?.approveMemberRequests;
  const deleteGroupPrompt = t('prompts.deleteItem', { itemType: 'group' });

  const editGroupPath = getEditGroupPath(name);
  const groupMembersPath = getGroupMembersPath(name);
  const groupPath = getGroupPath(name);
  const memberRequestsPath = getMemberRequestsPath(name);

  const handleDelete = async () =>
    await deleteGroup({
      variables: { id },
      update: removeGroup(id),
    });

  const handleRolesButtonClick = () => {
    const groupRolesPath = `${NavigationPaths.Groups}/${name}/roles`;
    navigate(groupRolesPath);
  };

  const handleSettingsButtonClick = () => {
    const settingsPath = `${NavigationPaths.Groups}/${name}/settings`;
    navigate(settingsPath);
  };

  const renderItemMenu = () => {
    const canDeleteGroup = myPermissions?.deleteGroup;
    const canUpdateGroup = myPermissions?.updateGroup;
    const canManageRoles = myPermissions?.manageRoles;
    const canManageSettings = myPermissions?.manageSettings;
    if (
      !canDeleteGroup &&
      !canUpdateGroup &&
      !canManageRoles &&
      !canManageSettings
    ) {
      return null;
    }

    return (
      <ItemMenu
        anchorEl={menuAnchorEl}
        canDelete={canDeleteGroup}
        canUpdate={canUpdateGroup}
        deleteItem={handleDelete}
        deletePrompt={deleteGroupPrompt}
        editPath={editGroupPath}
        setAnchorEl={setMenuAnchorEl}
      >
        {canManageSettings && (
          <MenuItem onClick={handleSettingsButtonClick}>
            <Settings fontSize="small" sx={{ marginRight: 1 }} />
            {t('groups.labels.settings')}
          </MenuItem>
        )}
        {canManageRoles && (
          <MenuItem onClick={handleRolesButtonClick}>
            <AccountBox fontSize="small" sx={{ marginRight: 1 }} />
            {t('roles.actions.manageRoles')}
          </MenuItem>
        )}
      </ItemMenu>
    );
  };

  return (
    <Card {...cardProps}>
      <CardHeader
        action={renderItemMenu()}
        avatar={<GroupAvatar group={group} />}
        title={<Link href={groupPath}>{name}</Link>}
      />
      <CardContent>
        <Typography sx={{ marginBottom: 1.25 }}>{description}</Typography>

        <Box sx={{ marginBottom: isLoggedIn ? 1.75 : 0 }}>
          <Link href={isLoggedIn ? groupMembersPath : groupPath}>
            {t('groups.labels.members', { count: memberCount })}
          </Link>

          {canApproveMemberRequests &&
            typeof memberRequestCount === 'number' && (
              <>
                {MIDDOT_WITH_SPACES}
                <Link href={memberRequestsPath}>
                  {t('groups.labels.requests', { count: memberRequestCount })}
                </Link>
              </>
            )}
        </Box>

        {isLoggedIn && (
          <JoinButton
            isGroupMember={isJoinedByMe}
            currentUserId={currentUserId}
            groupId={id}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default GroupCard;
