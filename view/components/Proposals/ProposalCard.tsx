import { useReactiveVar } from '@apollo/client';
import { SettingsSuggest } from '@mui/icons-material';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { ProposalStage } from '../../constants/proposal.constants';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '../../constants/shared.constants';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { ProposalCardFragment } from '../../graphql/proposals/fragments/gen/ProposalCard.gen';
import { useDeleteProposalMutation } from '../../graphql/proposals/mutations/gen/DeleteProposal.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { removeProposal } from '../../utils/cache.utils';
import { getGroupPath } from '../../utils/group.utils';
import { getProposalActionLabel } from '../../utils/proposal.utils';
import { urlifyText } from '../../utils/shared.utils';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import GroupItemAvatar from '../Groups/GroupItemAvatar';
import AttachedImageList from '../Images/AttachedImageList';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import ProposalAction from './ProposalActions/ProposalAction';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalSettingsModal from './ProposalSettingsModal';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
  '& .MuiCardHeader-avatar': {
    marginRight: 11,
  },
  '& .MuiCardHeader-title': {
    fontSize: 15,
  },
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingBottom: 0,
  '&:last-child': {
    paddingBottom: 0,
  },
}));

interface Props extends CardProps {
  proposal: ProposalCardFragment;
  inModal?: boolean;
}

const ProposalCard = ({ proposal, inModal, ...cardProps }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [deleteProposal] = useDeleteProposalMutation();
  const { data } = useMeQuery({
    skip: !isLoggedIn,
  });

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    id,
    action,
    body,
    createdAt,
    group,
    images,
    settings,
    stage,
    user,
    voteCount,
  } = proposal;

  const me = data && data.me;
  const isMe = me?.id === user.id;
  const isGroupPage = pathname.includes(NavigationPaths.Groups);
  const isProposalPage = pathname.includes(NavigationPaths.Proposals);

  const hasMedia =
    action.event ||
    action.groupCoverPhoto ||
    action.groupDescription ||
    action.groupName ||
    action.role ||
    images.length;

  const groupPath = getGroupPath(group?.name || '');
  const proposalPath = `${NavigationPaths.Proposals}/${id}`;
  const userProfilePath = getUserProfilePath(user?.name);
  const formattedDate = timeAgo(createdAt);

  const bodyStyles = {
    lineHeight: 1.25,
    whiteSpace: 'pre-wrap',
    marginBottom: hasMedia ? 2.5 : 3.5,
  };
  const cardContentStyles = {
    paddingTop: images.length && !body ? 2.5 : 3,
    paddingX: inModal ? 0 : undefined,
  };

  const handleDelete = async () => {
    if (isProposalPage) {
      navigate(NavigationPaths.Home);
    }
    await deleteProposal({
      variables: { id },
      update: removeProposal(id),
      onError() {
        toastVar({
          status: 'error',
          title: t('proposals.errors.couldNotDelete'),
        });
      },
    });
  };

  const handleViewSettingsBtnClick = () => {
    setShowSettingsModal(true);
    setMenuAnchorEl(null);
  };

  const renderAvatar = () => {
    if (group && !isGroupPage) {
      return <GroupItemAvatar user={user} group={group} />;
    }
    return <UserAvatar user={user} withLink />;
  };

  const renderTitle = () => {
    const actionLabel = getProposalActionLabel(action.actionType, t);
    const showGroup = group && !isGroupPage;

    return (
      <Box marginBottom={showGroup ? -0.5 : 0}>
        {showGroup && (
          <Link href={groupPath}>
            <Typography color="primary" lineHeight={1} fontSize={15}>
              {group.name}
            </Typography>
          </Link>
        )}
        <Box fontSize={14} sx={{ color: 'text.secondary' }}>
          <Link
            href={userProfilePath}
            sx={showGroup ? { color: 'inherit' } : undefined}
          >
            {user.displayName || user.name}
          </Link>
          {MIDDOT_WITH_SPACES}

          {isGroupPage && (
            <>
              <Link href={proposalPath} sx={{ color: 'inherit', fontSize: 13 }}>
                {actionLabel}
              </Link>
              {MIDDOT_WITH_SPACES}
            </>
          )}

          <Link href={proposalPath} sx={{ color: 'inherit', fontSize: 13 }}>
            {formattedDate}
          </Link>
        </Box>
      </Box>
    );
  };

  const renderMenu = () => {
    const editPath = `${NavigationPaths.Proposals}/${id}${NavigationPaths.Edit}`;
    const deletePrompt = t('prompts.deleteItem', { itemType: 'proposal' });

    const canDelete =
      (isMe && !voteCount) || me?.serverPermissions.removeProposals;

    return (
      <ItemMenu
        anchorEl={menuAnchorEl}
        canDelete={canDelete}
        deleteItem={handleDelete}
        deletePrompt={deletePrompt}
        editPath={editPath}
        setAnchorEl={setMenuAnchorEl}
        prependChildren
      >
        <MenuItem onClick={handleViewSettingsBtnClick}>
          <SettingsSuggest fontSize="small" sx={{ marginRight: 1 }} />
          {t('proposals.labels.viewSettings')}
        </MenuItem>
      </ItemMenu>
    );
  };

  const renderProposal = () => (
    <>
      <CardHeader
        action={renderMenu()}
        avatar={renderAvatar()}
        title={renderTitle()}
        sx={{
          paddingX: inModal ? 0 : undefined,
          paddingTop: inModal ? 0 : undefined,
        }}
      />

      <CardContent sx={cardContentStyles}>
        {body && (
          <Typography
            dangerouslySetInnerHTML={{ __html: urlifyText(body) }}
            sx={bodyStyles}
          />
        )}

        <Link href={proposalPath}>
          {!!images.length && (
            <AttachedImageList images={images} marginBottom={me ? 1.9 : 0} />
          )}
        </Link>

        <ProposalAction
          action={action}
          ratified={stage === ProposalStage.Ratified}
        />
      </CardContent>

      <ProposalCardFooter
        currentUserId={me?.id}
        groupId={group?.id}
        isProposalPage={isProposalPage}
        proposal={proposal}
        inModal={inModal}
      />

      <ProposalSettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        settings={settings}
      />
    </>
  );

  if (inModal) {
    return renderProposal();
  }

  return <Card {...cardProps}>{renderProposal()}</Card>;
};

export default ProposalCard;
