import {
  AutoAwesome,
  Check,
  Comment,
  Group,
  HowToVote,
  PanTool,
  Person,
  ThumbDown,
  ThumbUp,
  ThumbsUpDown,
} from '@mui/icons-material';
import { Box, MenuItem, SxProps, Typography, useTheme } from '@mui/material';

import { produce } from 'immer';
import { useState } from 'react';
import { Namespace, TFunction, useTranslation } from 'react-i18next';
import {
  NotificationStatus,
  NotificationType,
} from '../../constants/notifications.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { VOTE_BADGE_STYLES } from '../../constants/vote.constants';
import { NotificationFragment } from '../../graphql/notifications/fragments/gen/Notification.gen';
import { useDeleteNotificationMutation } from '../../graphql/notifications/mutations/gen/DeleteNotification.gen';
import { useUpdateNotificationMutation } from '../../graphql/notifications/mutations/gen/UpdateNotification.gen';
import {
  UnreadNotificationsDocument,
  UnreadNotificationsQuery,
} from '../../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { getMemberRequestsPath } from '../../utils/group.utils';
import { timeAgo } from '../../utils/time.utils';
import GroupAvatar from '../Groups/GroupAvatar';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  notification: NotificationFragment;
  isLast: boolean;
  isFirst: boolean;
}

const Notification = ({
  notification: {
    id,
    notificationType,
    otherUser,
    status,
    post,
    group,
    proposal,
    createdAt,
    __typename,
  },
  isFirst,
  isLast,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [updateNotification, { loading: updateLoading }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { loading: deleteLoading }] =
    useDeleteNotificationMutation();

  const { t } = useTranslation();
  const theme = useTheme();

  const isUnread = status === NotificationStatus.Unread;

  const isProposalVote = [
    NotificationType.ProposalVoteAgreement,
    NotificationType.ProposalVoteReservations,
    NotificationType.ProposalVoteStandAside,
    NotificationType.ProposalVoteBlock,
  ].includes(notificationType as NotificationType);

  const iconContainerStyles: SxProps = {
    ...VOTE_BADGE_STYLES,
    border: `2px solid ${theme.palette.background.paper}`,
    height: 23,
    width: 23,
    position: 'absolute',
    top: 22,
    left: 23,
  };
  const iconStyles: SxProps = {
    fontSize: 10,
    marginTop: 0.5,
    color: 'text.primary',
    transform:
      notificationType === NotificationType.ProposalVoteBlock
        ? 'translateX(-0.5px)'
        : null,
  };

  const getNotificationMessage = () => {
    const _t: TFunction<Namespace<'ns1'>, undefined> = t;

    if (notificationType === NotificationType.Follow) {
      return _t('notifications.messages.follow', {
        name: otherUser?.name,
      });
    }
    if (notificationType === NotificationType.PostLike) {
      return _t('notifications.messages.postLike', {
        name: otherUser?.name,
      });
    }
    if (isProposalVote) {
      return _t('notifications.messages.proposalVote', {
        name: otherUser?.name,
      });
    }
    if (notificationType === NotificationType.ProposalRatification) {
      return _t('notifications.messages.proposalRatification', {
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.ProposalComment) {
      return _t('notifications.messages.proposalComment', {
        name: otherUser?.name,
      });
    }
    if (notificationType === NotificationType.PostComment) {
      return _t('notifications.messages.postComment', {
        name: otherUser?.name,
      });
    }
    if (notificationType === NotificationType.CommentLike) {
      return _t('notifications.messages.commentLike', {
        name: otherUser?.name,
      });
    }
    if (notificationType === NotificationType.GroupMemberRequest) {
      return _t('notifications.messages.groupMemberRequest', {
        name: otherUser?.name,
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.GroupMemberRequestApproval) {
      return _t('notifications.messages.groupMemberRequestApproval', {
        groupName: group?.name,
      });
    }
    return _t('notifications.errors.invalidType');
  };

  const convertBoldToSpan = (message: string) => {
    return message
      .replace(/<b>/g, '<span style="font-family: Inter Bold;">')
      .replace(/<\/b>/g, '</span>');
  };

  const getPath = () => {
    if (
      isProposalVote ||
      notificationType === NotificationType.ProposalComment ||
      notificationType === NotificationType.ProposalRatification
    ) {
      return `${NavigationPaths.Proposals}/${proposal?.id}`;
    }
    if (notificationType === NotificationType.PostComment) {
      return `${NavigationPaths.Posts}/${post?.id}`;
    }
    if (notificationType === NotificationType.PostLike) {
      return `${NavigationPaths.Posts}/${post?.id}`;
    }
    if (notificationType === NotificationType.Follow) {
      return `${NavigationPaths.Users}/${otherUser?.name}`;
    }
    if (notificationType === NotificationType.GroupMemberRequest) {
      return getMemberRequestsPath(group?.name as string);
    }
    if (notificationType === NotificationType.GroupMemberRequestApproval) {
      return `${NavigationPaths.Groups}/${group?.name}`;
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

  const handleRead = () => {
    updateNotification({
      variables: {
        notificationData: { id, status: NotificationStatus.Read },
      },
      update(cache) {
        cache.updateQuery<UnreadNotificationsQuery>(
          { query: UnreadNotificationsDocument },
          (notificationsData) =>
            produce(notificationsData, (draft) => {
              if (!draft) {
                return;
              }
              draft.unreadNotificationsCount -= 1;
            }),
        );
      },
    });
    setMenuAnchorEl(null);
  };

  const renderIcon = () => {
    if (notificationType === NotificationType.ProposalVoteReservations) {
      return <ThumbsUpDown sx={iconStyles} />;
    }
    if (notificationType === NotificationType.ProposalVoteStandAside) {
      return <ThumbDown sx={iconStyles} />;
    }
    if (notificationType === NotificationType.ProposalVoteBlock) {
      return <PanTool sx={iconStyles} />;
    }
    if (
      notificationType === NotificationType.ProposalVoteAgreement ||
      notificationType === NotificationType.CommentLike ||
      notificationType === NotificationType.PostLike
    ) {
      return <ThumbUp sx={iconStyles} />;
    }
    if (notificationType === NotificationType.ProposalRatification) {
      return (
        <HowToVote sx={{ ...iconStyles, fontSize: 11, marginTop: 0.45 }} />
      );
    }
    if (notificationType.includes('comment')) {
      return <Comment sx={{ ...iconStyles, marginTop: 0.6 }} />;
    }
    if (notificationType === NotificationType.Follow) {
      return <Person sx={iconStyles} />;
    }
    if (
      notificationType === NotificationType.GroupMemberRequest ||
      notificationType === NotificationType.GroupMemberRequestApproval
    ) {
      return <Group sx={iconStyles} />;
    }
    return <AutoAwesome sx={iconStyles} />;
  };

  return (
    <Flex
      paddingX="16px"
      paddingTop={isFirst ? '16px' : '8px'}
      paddingBottom={isLast ? '16px' : '8px'}
      alignItems="center"
      justifyContent="space-between"
      bgcolor={isUnread ? 'rgba(88, 101, 242, 0.1)' : 'transparent'}
    >
      <Link
        href={getPath()}
        onClick={handleRead}
        sx={{
          marginRight: '5px',
          display: 'flex',
          gap: '13px',
          flex: 1,
        }}
      >
        {otherUser && (
          <Box position="relative">
            <UserAvatar user={otherUser} />
            <Box sx={iconContainerStyles}>{renderIcon()}</Box>
          </Box>
        )}

        {group && !otherUser && (
          <Box position="relative">
            <GroupAvatar group={group} withLink={false} />
            <Box sx={iconContainerStyles}>{renderIcon()}</Box>
          </Box>
        )}

        <Box>
          <Typography
            dangerouslySetInnerHTML={{
              __html: convertBoldToSpan(getNotificationMessage()),
            }}
            lineHeight={1.25}
            marginBottom={0.25}
            marginTop={0.25}
          />

          <Typography color="text.secondary" fontSize="13px" marginTop="-2px">
            {timeAgo(createdAt)}
          </Typography>
        </Box>
      </Link>

      <ItemMenu
        anchorEl={menuAnchorEl}
        deleteBtnLabel={t('notifications.labels.delete')}
        deleteItem={handleDelete}
        deletePrompt={t('notifications.prompts.confirmDelete')}
        loading={updateLoading || deleteLoading}
        setAnchorEl={setMenuAnchorEl}
        prependChildren
        canDelete
      >
        <MenuItem onClick={handleRead} disabled={!isUnread}>
          <Check fontSize="small" sx={{ marginRight: 1 }} />
          {t('notifications.labels.markAsRead')}
        </MenuItem>
      </ItemMenu>
    </Flex>
  );
};

export default Notification;
