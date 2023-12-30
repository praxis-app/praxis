import { useReactiveVar } from '@apollo/client';
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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GroupAdminModel } from '../../constants/group.constants';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '../../constants/shared.constants';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { GroupCardFragment } from '../../graphql/groups/fragments/gen/GroupCard.gen';
import { useDeleteGroupMutation } from '../../graphql/groups/mutations/gen/DeleteGroup.gen';
import { removeGroup } from '../../utils/cache.utils';
import {
  getEditGroupPath,
  getGroupMembersPath,
  getGroupPath,
  getMemberRequestsPath,
} from '../../utils/group.utils';
import { urlifyText } from '../../utils/shared.utils';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import GroupAvatar from './GroupAvatar';
import JoinButton from './JoinButton';

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
  canRemoveGroups?: boolean;
}

const GroupCard = ({
  group,
  currentUserId,
  canRemoveGroups,
  ...cardProps
}: Props) => {
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
    settings,
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
      onError() {
        toastVar({
          status: 'error',
          title: t('groups.errors.couldNotDelete'),
        });
      },
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
    const isNoAdmin = settings.adminModel === GroupAdminModel.NoAdmin;
    if (isNoAdmin) {
      return null;
    }

    const canDeleteGroup = myPermissions?.deleteGroup || canRemoveGroups;
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
        <Typography
          dangerouslySetInnerHTML={{ __html: urlifyText(description) }}
          whiteSpace="pre-wrap"
          marginBottom={1.25}
        />

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
