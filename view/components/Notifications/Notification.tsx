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
import {
  Box,
  MenuItem,
  SvgIconProps,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';

import { produce } from 'immer';
import { useState } from 'react';
import { Namespace, TFunction, useTranslation } from 'react-i18next';
import {
  NotificationStatus,
  NotificationType,
} from '../../constants/notifications.constants';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '../../constants/shared.constants';
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
}

const Notification = ({
  notification: {
    id,
    actionType,
    otherUser,
    status,
    post,
    group,
    proposal,
    createdAt,
    __typename,
  },
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [updateNotification, { loading: updateLoading }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { loading: deleteLoading }] =
    useDeleteNotificationMutation();

  const { t } = useTranslation();
  const theme = useTheme();

  const isRead = status === NotificationStatus.Read;

  const isProposalVote = [
    NotificationType.ProposalVoteAgreement,
    NotificationType.ProposalVoteReservations,
    NotificationType.ProposalVoteStandAside,
    NotificationType.ProposalVoteBlock,
  ].includes(actionType as NotificationType);

  const iconStyles: SxProps = {
    ...VOTE_BADGE_STYLES,
    border: `2px solid ${theme.palette.background.paper}`,
    height: 20,
    width: 20,
    position: 'absolute',
    top: 25,
    left: 26,
  };

  const getNotificationMessage = () => {
    const _t: TFunction<Namespace<'ns1'>, undefined> = t;

    if (actionType === NotificationType.Follow) {
      return _t('notifications.messages.follow', {
        name: otherUser?.name,
      });
    }
    if (actionType === NotificationType.PostLike) {
      return _t('notifications.messages.postLike', {
        name: otherUser?.name,
      });
    }
    if (isProposalVote) {
      return _t('notifications.messages.proposalVote', {
        name: otherUser?.name,
      });
    }
    if (actionType === NotificationType.ProposalRatification) {
      return _t('notifications.messages.proposalRatification', {
        groupName: group?.name,
      });
    }
    if (actionType === NotificationType.ProposalComment) {
      return _t('notifications.messages.proposalComment', {
        name: otherUser?.name,
      });
    }
    if (actionType === NotificationType.PostComment) {
      return _t('notifications.messages.postComment', {
        name: otherUser?.name,
      });
    }
    if (actionType === NotificationType.GroupMemberRequest) {
      return _t('notifications.messages.groupMemberRequest', {
        name: otherUser?.name,
        groupName: group?.name,
      });
    }
    if (actionType === NotificationType.GroupMemberRequestApproval) {
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
      actionType === NotificationType.ProposalComment ||
      actionType === NotificationType.ProposalRatification
    ) {
      return `${NavigationPaths.Proposals}/${proposal?.id}`;
    }
    if (actionType === NotificationType.PostComment) {
      return `${NavigationPaths.Posts}/${post?.id}`;
    }
    if (actionType === NotificationType.PostLike) {
      return `${NavigationPaths.Posts}/${post?.id}`;
    }
    if (actionType === NotificationType.Follow) {
      return `${NavigationPaths.Users}/${otherUser?.name}`;
    }
    if (actionType === NotificationType.GroupMemberRequest) {
      return getMemberRequestsPath(group?.name as string);
    }
    if (actionType === NotificationType.GroupMemberRequestApproval) {
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
    const sx: SxProps = {
      fontSize: 8,
      marginTop: 0.5,
      transform:
        actionType === NotificationType.ProposalVoteBlock
          ? 'translateX(-0.5px)'
          : null,
    };
    const iconProps: SvgIconProps = {
      color: 'primary',
      sx,
    };
    if (actionType === NotificationType.ProposalVoteReservations) {
      return <ThumbsUpDown {...iconProps} />;
    }
    if (actionType === NotificationType.ProposalVoteStandAside) {
      return <ThumbDown {...iconProps} />;
    }
    if (actionType === NotificationType.ProposalVoteBlock) {
      return <PanTool {...iconProps} />;
    }
    if (
      actionType === NotificationType.ProposalVoteAgreement ||
      actionType === NotificationType.PostLike
    ) {
      return <ThumbUp {...iconProps} />;
    }
    if (actionType === NotificationType.ProposalRatification) {
      return <HowToVote {...iconProps} />;
    }
    if (actionType.includes('comment')) {
      return <Comment {...iconProps} />;
    }
    if (actionType === NotificationType.Follow) {
      return <Person {...iconProps} />;
    }
    if (
      actionType === NotificationType.GroupMemberRequest ||
      actionType === NotificationType.GroupMemberRequestApproval
    ) {
      return <Group {...iconProps} />;
    }
    return <AutoAwesome {...iconProps} />;
  };

  return (
    <Flex alignItems="center" justifyContent="space-between">
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
            <Box sx={iconStyles}>{renderIcon()}</Box>
          </Box>
        )}

        {group && !otherUser && (
          <Box position="relative">
            <GroupAvatar group={group} withLink={false} />
            <Box sx={iconStyles}>{renderIcon()}</Box>
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
            {!isRead &&
              MIDDOT_WITH_SPACES + ' ' + t('notifications.labels.unread')}
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
        <MenuItem onClick={handleRead} disabled={isRead}>
          <Check fontSize="small" sx={{ marginRight: 1 }} />
          {t('notifications.labels.markAsRead')}
        </MenuItem>
      </ItemMenu>
    </Flex>
  );
};

export default Notification;
