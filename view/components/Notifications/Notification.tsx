import {
  AutoAwesome,
  Comment,
  PanTool,
  ThumbDown,
  ThumbUp,
  ThumbsUpDown,
} from '@mui/icons-material';
import {
  Box,
  SvgIconProps,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import { Namespace, TFunction } from 'react-i18next';
import { NotificationActionType } from '../../constants/notifications.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { VOTE_BADGE_STYLES } from '../../constants/vote.constants';
import { NotificationFragment } from '../../graphql/notifications/fragments/gen/Notification.gen';
import { useDeleteNotificationMutation } from '../../graphql/notifications/mutations/gen/DeleteNotification.gen';
import { timeAgo } from '../../utils/time.utils';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  notification: NotificationFragment;
}

const Notification = ({
  notification: {
    id,
    actionType,
    otherUser,
    post,
    proposal,
    createdAt,
    __typename,
  },
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteNotification] = useDeleteNotificationMutation();

  const theme = useTheme();

  const isProposalVote = [
    NotificationActionType.ProposalVoteAgreement,
    NotificationActionType.ProposalVoteReservations,
    NotificationActionType.ProposalVoteStandAside,
    NotificationActionType.ProposalVoteBlock,
  ].includes(actionType as NotificationActionType);

  const voteBadgeStyles: SxProps = {
    ...VOTE_BADGE_STYLES,
    border: `2px solid ${theme.palette.background.paper}`,
    height: 20,
    width: 20,
    position: 'absolute',
    top: 25,
    left: 26,
  };

  const getNotificationMessage = (actionType: string, name?: string) => {
    const _t: TFunction<Namespace<'ns1'>, undefined> = t;

    if (isProposalVote) {
      return _t('notifications.messages.proposalVote', { name });
    }
    if (actionType === NotificationActionType.ProposalComment) {
      return _t('notifications.messages.proposalComment', { name });
    }
    if (actionType === NotificationActionType.PostComment) {
      return _t('notifications.messages.postComment', { name });
    }
    if (actionType === NotificationActionType.PostLike) {
      return _t('notifications.messages.postLike', { name });
    }
    return _t('notifications.errors.invalidType');
  };

  const convertBoldToSpan = (message: string) => {
    return message
      .replace(/<b>/g, '<span style="font-family: Inter Bold;">')
      .replace(/<\/b>/g, '</span>');
  };

  const getPath = () => {
    if (isProposalVote) {
      return `${NavigationPaths.Proposals}/${proposal?.id}`;
    }
    if (actionType === NotificationActionType.ProposalComment) {
      return `${NavigationPaths.Proposals}/${proposal?.id}`;
    }
    if (actionType === NotificationActionType.PostComment) {
      return `${NavigationPaths.Posts}/${post?.id}`;
    }
    return NavigationPaths.Home;
  };

  const handleDelete = () => {
    deleteNotification({
      variables: { id },
      update(cache) {
        const cacheId = cache.identify({ id, __typename });
        cache.evict({ id: cacheId });
        cache.gc();
      },
    });
  };

  const renderVoteIcon = () => {
    const sx: SxProps = {
      fontSize: 8,
      marginTop: 0.5,
      transform:
        actionType === NotificationActionType.ProposalVoteBlock
          ? 'translateX(-0.5px)'
          : null,
    };
    const iconProps: SvgIconProps = {
      color: 'primary',
      sx,
    };
    if (actionType === NotificationActionType.ProposalVoteReservations) {
      return <ThumbsUpDown {...iconProps} />;
    }
    if (actionType === NotificationActionType.ProposalVoteStandAside) {
      return <ThumbDown {...iconProps} />;
    }
    if (actionType === NotificationActionType.ProposalVoteBlock) {
      return <PanTool {...iconProps} />;
    }
    if (actionType === NotificationActionType.ProposalVoteAgreement) {
      return <ThumbUp {...iconProps} />;
    }
    if (actionType.includes('comment')) {
      return <Comment {...iconProps} />;
    }
    return <AutoAwesome {...iconProps} />;
  };

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Link
        href={getPath()}
        sx={{
          display: 'flex',
          gap: '13px',
          flex: 1,
          marginRight: '5px',
        }}
      >
        {otherUser && (
          <Box position="relative">
            <UserAvatar user={otherUser} />
            <Box sx={voteBadgeStyles}>{renderVoteIcon()}</Box>
          </Box>
        )}

        <Box>
          <Typography
            dangerouslySetInnerHTML={{
              __html: convertBoldToSpan(
                getNotificationMessage(actionType, otherUser?.name),
              ),
            }}
            lineHeight={1}
            marginBottom={0.5}
            marginTop={0.25}
          />
          <Typography color="text.secondary" fontSize="13px" marginTop="-2px">
            {timeAgo(createdAt)}
          </Typography>
        </Box>
      </Link>

      <ItemMenu
        anchorEl={menuAnchorEl}
        deleteItem={handleDelete}
        deletePrompt={t('notifications.prompts.confirmDelete')}
        setAnchorEl={setMenuAnchorEl}
        canDelete
      />
    </Flex>
  );
};

export default Notification;
