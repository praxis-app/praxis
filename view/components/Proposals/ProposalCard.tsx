import { useReactiveVar } from '@apollo/client';
import {
  Box,
  Card,
  CardProps,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { isLoggedInVar, toastVar } from '../../apollo/cache';
import { useDeleteProposalMutation } from '../../apollo/proposals/generated/DeleteProposal.mutation';
import { ProposalCardFragment } from '../../apollo/proposals/generated/ProposalCard.fragment';
import { useMeQuery } from '../../apollo/users/generated/Me.query';
import { ProposalStage } from '../../constants/proposal.constants';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '../../constants/shared.constants';
import { getGroupPath } from '../../utils/group.utils';
import { getProposalActionLabel } from '../../utils/proposal.utils';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import GroupItemAvatar from '../Groups/GroupItemAvatar';
import AttachedImageList from '../Images/AttachedImageList';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import { removeProposal } from './DeleteProposalButton';
import ProposalAction from './ProposalActions/ProposalAction';
import ProposalCardFooter from './ProposalCardFooter';

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
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [deleteProposal] = useDeleteProposalMutation();
  const { data } = useMeQuery({
    skip: !isLoggedIn,
  });

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { action, body, createdAt, group, id, images, user, voteCount, stage } =
    proposal;

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
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
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
            {user?.name}
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
    if (voteCount) {
      return null;
    }
    const editPath = `${NavigationPaths.Proposals}/${id}${NavigationPaths.Edit}`;
    const deletePrompt = t('prompts.deleteItem', { itemType: 'proposal' });
    return (
      <ItemMenu
        anchorEl={menuAnchorEl}
        canDelete={isMe}
        deleteItem={handleDelete}
        deletePrompt={deletePrompt}
        editPath={editPath}
        setAnchorEl={setMenuAnchorEl}

        // TODO: Uncomment when implementing revisions or drafts for proposals
        // canUpdate={isMe}
      />
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
        {body && <Typography sx={bodyStyles}>{body}</Typography>}

        <ProposalAction
          action={action}
          ratified={stage === ProposalStage.Ratified}
        />

        <Link href={proposalPath}>
          {!!images.length && (
            <AttachedImageList images={images} marginBottom={me ? 1.9 : 0} />
          )}
        </Link>
      </CardContent>

      <ProposalCardFooter
        currentUserId={me?.id}
        groupId={group?.id}
        isProposalPage={isProposalPage}
        proposal={proposal}
        inModal={inModal}
      />
    </>
  );

  if (inModal) {
    return renderProposal();
  }

  return <Card {...cardProps}>{renderProposal()}</Card>;
};

export default ProposalCard;
