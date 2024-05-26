import { useReactiveVar } from '@apollo/client';
import { AccountBox, Chat, Lock, Public, Settings } from '@mui/icons-material';
import {
  Box,
  Card,
  CardProps,
  Divider,
  MenuItem,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  SxProps,
  Tab,
  Tabs,
  Typography,
  styled,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GroupAdminModel, GroupTab } from '../../constants/group.constants';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';
import { isLoggedInVar, isVerifiedVar, toastVar } from '../../graphql/cache';
import { GroupPageCardFragment } from '../../graphql/groups/fragments/gen/GroupPageCard.gen';
import { useDeleteGroupMutation } from '../../graphql/groups/mutations/gen/DeleteGroup.gen';
import { useAboveBreakpoint, useIsDesktop } from '../../hooks/shared.hooks';
import { removeGroup } from '../../utils/cache.utils';
import {
  getEditGroupPath,
  getGroupMembersPath,
  getGroupPath,
  getMemberRequestsPath,
} from '../../utils/group.utils';
import CoverPhoto from '../Images/CoverPhoto';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import JoinGroupButton from './JoinGroupButton';
import GhostButton from '../Shared/GhostButton';

const NameText = styled(Typography)(() => ({
  fontFamily: 'Inter Bold',
  marginBottom: 7.5,
}));
const CardHeader = styled(MuiCardHeader)(() => ({
  marginTop: 7.5,
  paddingBottom: 0,
  paddingRight: 22,
}));
const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

interface Props extends CardProps {
  canRemoveGroups?: boolean;
  currentUserId?: number;
  group: GroupPageCardFragment;
  setTab(tab: number): void;
  tab: number;
}

const GroupPageCard = ({
  canRemoveGroups,
  currentUserId,
  group,
  setTab,
  tab,
  ...cardProps
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);
  const [deleteGroup] = useDeleteGroupMutation();

  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isAboveMedium = useAboveBreakpoint('md');
  const isAboveSmall = useAboveBreakpoint('sm');
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (!tabParam) {
      return;
    }
    if (tabParam === GroupTab.Events) {
      setTab(1);
      return;
    }
    if (tabParam === GroupTab.About) {
      setTab(2);
    }
  }, [tabParam, setTab]);

  const {
    id,
    name,
    coverPhoto,
    memberCount,
    memberRequestCount,
    myPermissions,
    settings,
  } = group;

  const canApproveMemberRequests = myPermissions?.approveMemberRequests;
  const showCardHeader = isLoggedIn && isAboveSmall;

  const groupPath = getGroupPath(name);
  const editGroupPath = getEditGroupPath(name);
  const groupMembersPath = getGroupMembersPath(name);
  const memberRequestsPath = getMemberRequestsPath(name);
  const deleteGroupPrompt = t('prompts.deleteItem', { itemType: 'group' });

  const groupPagePath = `${NavigationPaths.Groups}/${name}`;
  const aboutTabPath = `${groupPagePath}${TAB_QUERY_PARAM}${GroupTab.About}`;
  const eventsTabPath = `${groupPagePath}${TAB_QUERY_PARAM}${GroupTab.Events}`;
  const groupChatPath = `${groupPagePath}${NavigationPaths.Chat}`;

  const getNameTextWidth = () => {
    if (isAboveMedium) {
      return '75%';
    }
    if (isAboveSmall) {
      return '70%';
    }
    return '100%';
  };

  const nameTextStyles: SxProps = {
    width: getNameTextWidth(),
    fontSize: isAboveSmall ? 25 : 23,
    marginTop: showCardHeader ? -7 : -0.3,
    marginBottom: 1,
  };
  const iconStyles: SxProps = {
    marginBottom: -0.5,
    marginRight: '0.3ch',
    fontSize: 20,
  };

  const handleDelete = async () => {
    navigate(NavigationPaths.Groups);
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
  };

  const handleRolesButtonClick = async () => {
    const groupRolesPath = `${NavigationPaths.Groups}/${name}/roles`;
    navigate(groupRolesPath);
  };

  const handleSettingsButtonClick = async () => {
    const settingsPath = `${NavigationPaths.Groups}/${name}/settings`;
    navigate(settingsPath);
  };

  const handleTabsChange = (_: React.SyntheticEvent, newValue: number) =>
    setTab(newValue);

  const renderCardActions = () => {
    const isNoAdmin = settings.adminModel === GroupAdminModel.NoAdmin;
    const canManageRoles = !isNoAdmin && myPermissions?.manageRoles;
    const canManageSettings = !isNoAdmin && myPermissions?.manageSettings;
    const canUpdateGroup = !isNoAdmin && myPermissions?.updateGroup;

    const canDeleteGroup =
      (!isNoAdmin && myPermissions?.deleteGroup) || canRemoveGroups;

    const showMenuButton =
      canDeleteGroup || canUpdateGroup || canManageRoles || canManageSettings;

    return (
      <>
        {group.isJoinedByMe && !isDesktop && (
          <GhostButton
            onClick={() => navigate(groupChatPath)}
            sx={{ marginRight: '8px' }}
            startIcon={<Chat />}
          >
            {t('chat.labels.chat')}
          </GhostButton>
        )}

        <JoinGroupButton
          groupId={id}
          currentUserId={currentUserId}
          isGroupMember={group.isJoinedByMe}
        />

        {showMenuButton && (
          <ItemMenu
            anchorEl={menuAnchorEl}
            buttonStyles={{ paddingX: 0, minWidth: 38 }}
            canDelete={canDeleteGroup}
            canUpdate={canUpdateGroup}
            deleteItem={handleDelete}
            deletePrompt={deleteGroupPrompt}
            editPath={editGroupPath}
            setAnchorEl={setMenuAnchorEl}
            variant="ghost"
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
        )}
      </>
    );
  };

  return (
    <Card {...cardProps}>
      <CoverPhoto imageId={coverPhoto?.id} />
      {showCardHeader && <CardHeader action={renderCardActions()} />}
      <CardContent>
        <NameText color="primary" variant="h2" sx={nameTextStyles}>
          {name}
        </NameText>

        <Box fontSize={isAboveSmall ? undefined : 15}>
          <Link href={'/'} disabled>
            {settings.isPublic ? (
              <>
                <Public sx={iconStyles} />
                {t('groups.labels.public')}
              </>
            ) : (
              <>
                <Lock sx={iconStyles} />
                {t('groups.labels.private')}
              </>
            )}
          </Link>

          {MIDDOT_WITH_SPACES}

          <Link href={isVerified ? groupMembersPath : groupPath}>
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

        {isVerified && !isAboveSmall && (
          <Flex sx={{ justifyContent: 'right', marginTop: 2 }}>
            {renderCardActions()}
          </Flex>
        )}
      </CardContent>

      <Divider sx={{ marginX: '16px', marginBottom: 0.25 }} />

      <Tabs onChange={handleTabsChange} textColor="inherit" value={tab}>
        <Tab
          label={t('groups.tabs.feed')}
          onClick={() => navigate(groupPagePath)}
        />
        <Tab
          label={t('groups.tabs.events')}
          onClick={() => navigate(eventsTabPath)}
        />
        <Tab
          label={t('groups.tabs.about')}
          onClick={() => navigate(aboutTabPath)}
        />
      </Tabs>
    </Card>
  );
};

export default GroupPageCard;
