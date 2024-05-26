import {
  AutoAwesome,
  Check,
  CommentSharp,
  Group,
  HowToVote,
  MessageRounded,
  PanTool,
  Person,
  QuestionAnswer,
  ThumbDown,
  ThumbUp,
  ThumbsUpDown,
  Verified,
} from '@mui/icons-material';
import { Box, MenuItem, SxProps, Typography, useTheme } from '@mui/material';
import { produce } from 'immer';
import { truncate } from 'lodash';
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
import { convertBoldToSpan } from '../../utils/shared.utils';
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
    comment,
    conversation,
    group,
    notificationType,
    otherUser,
    post,
    proposal,
    question,
    questionnaireTicket,
    status,
    unreadMessageCount,
    createdAt,
    __typename,
  },
  isFirst,
  isLast,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [updateNotification, { loading: updateLoading, client }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { loading: deleteLoading }] =
    useDeleteNotificationMutation();

  const { t } = useTranslation();
  const theme = useTheme();

  const isRead = status === NotificationStatus.Read;
  const otherUserName = otherUser?.displayName || otherUser?.name;

  const isProposalVote = [
    NotificationType.ProposalVoteAgreement,
    NotificationType.ProposalVoteReservations,
    NotificationType.ProposalVoteStandAside,
    NotificationType.ProposalVoteBlock,
  ].includes(notificationType as NotificationType);

  const isQuestionnaireTicketVote = [
    NotificationType.QuestionnaireTicketVoteAgreement,
    NotificationType.QuestionnaireTicketVoteReservations,
    NotificationType.QuestionnaireTicketVoteStandAside,
    NotificationType.QuestionnaireTicketVoteBlock,
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

    if (notificationType === NotificationType.NewMessage) {
      if (!conversation?.name) {
        return _t('notifications.errors.accessDenied');
      }
      return _t('notifications.messages.newMessage', {
        chatName: conversation.group?.name || conversation?.name,
        count: Number(unreadMessageCount),
      });
    }
    if (notificationType === NotificationType.Follow) {
      return _t('notifications.messages.follow', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.PostLike) {
      return _t('notifications.messages.postLike', {
        name: otherUserName,
      });
    }
    if (isProposalVote) {
      return _t('notifications.messages.proposalVote', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.ProposalRatification) {
      return _t('notifications.messages.proposalRatification', {
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.ProposalComment) {
      return _t('notifications.messages.proposalComment', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.PostComment) {
      return _t('notifications.messages.postComment', {
        name: otherUserName,
      });
    }
    if (isQuestionnaireTicketVote) {
      return _t('notifications.messages.questionnaireTicketVote', {
        name: otherUserName,
        ticketNumber: questionnaireTicket?.id,
      });
    }
    if (notificationType === NotificationType.QuestionnaireTicketComment) {
      if (!comment?.questionnaireTicket?.id) {
        return _t('notifications.errors.accessDenied');
      }
      if (comment?.questionnaireTicket?.user.id === otherUser?.id) {
        return _t('notifications.messages.ownQuestionnaireTicketComment', {
          name: otherUserName,
        });
      }
      return _t('notifications.messages.questionnaireTicketComment', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.QuestionnaireTicketSubmitted) {
      return _t('notifications.messages.questionnaireTicketSubmitted', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.AnswerComment) {
      if (comment?.question?.questionnaireTicket?.user.id === otherUser?.id) {
        return _t('notifications.messages.ownAnswerComment', {
          name: otherUserName,
        });
      }
      return _t('notifications.messages.answerComment', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.AnswerLike) {
      if (!question?.answer?.text) {
        return _t('notifications.messages.missingAnswerLike', {
          name: otherUserName,
        });
      }
      return _t('notifications.messages.answerLike', {
        name: otherUserName,
        text: `"${truncate(question?.answer?.text, { length: 30 })}"`,
      });
    }
    if (notificationType === NotificationType.CommentLike) {
      if (comment?.body) {
        return _t('notifications.messages.commentLikeWithText', {
          name: otherUserName,
          text: `"${truncate(comment?.body, { length: 30 })}"`,
        });
      }
      return _t('notifications.messages.commentLike', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.GroupMemberRequest) {
      return _t('notifications.messages.groupMemberRequest', {
        name: otherUserName,
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.GroupMemberRequestApproval) {
      return _t('notifications.messages.groupMemberRequestApproval', {
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.AddToDefaultGroup) {
      return _t('notifications.messages.addToDefaultGroup', {
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.NewQuestionnaireTicket) {
      return _t('notifications.messages.newQuestionnaireTicket', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.VerifyUser) {
      return _t('notifications.messages.verifyUser');
    }
    if (notificationType === NotificationType.DenyUserVerification) {
      return _t('notifications.messages.denyUserVerification');
    }
    return _t('notifications.errors.invalidType');
  };

  const getPath = () => {
    // TODO: Update to point to sepcific chat after adding full chat functionality
    if (notificationType === NotificationType.NewMessage) {
      return NavigationPaths.VibeChat;
    }
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
    if (notificationType === NotificationType.CommentLike) {
      if (comment?.question) {
        const queryParams = `${notificationType}=true&questionId=${comment.question.id}`;
        if (comment.question.questionnaireTicket.user.id === otherUser?.id) {
          const { id } = comment.question.questionnaireTicket;
          return `${NavigationPaths.ServerQuestionnaires}/${id}?${queryParams}`;
        }
        return `${NavigationPaths.VibeCheck}?${queryParams}`;
      }
      if (comment?.questionnaireTicket) {
        if (comment.questionnaireTicket.user.id === otherUser?.id) {
          const { id } = comment.questionnaireTicket;
          const queryParam = `${notificationType}=true`;
          return `${NavigationPaths.ServerQuestionnaires}/${id}?${queryParam}`;
        }
        return NavigationPaths.VibeCheck;
      }
      if (comment?.post?.id) {
        return `${NavigationPaths.Posts}/${comment.post.id}`;
      }
      return `${NavigationPaths.Proposals}/${comment?.proposal?.id}`;
    }
    if (notificationType === NotificationType.Follow) {
      return `${NavigationPaths.Users}/${otherUser?.name}`;
    }
    if (notificationType === NotificationType.GroupMemberRequest) {
      return getMemberRequestsPath(group?.name as string);
    }
    if (
      notificationType === NotificationType.GroupMemberRequestApproval ||
      notificationType === NotificationType.AddToDefaultGroup
    ) {
      return `${NavigationPaths.Groups}/${group?.name}`;
    }
    if (notificationType === NotificationType.QuestionnaireTicketComment) {
      if (comment?.questionnaireTicket?.user.id === otherUser?.id) {
        const ticketId = comment?.questionnaireTicket?.id;
        const queryParam = `${notificationType}=true`;
        return `${NavigationPaths.ServerQuestionnaires}/${ticketId}?${queryParam}`;
      }
      return NavigationPaths.VibeCheck;
    }
    if (
      notificationType === NotificationType.QuestionnaireTicketSubmitted ||
      notificationType === NotificationType.NewQuestionnaireTicket ||
      isQuestionnaireTicketVote
    ) {
      return `${NavigationPaths.ServerQuestionnaires}/${questionnaireTicket?.id}`;
    }
    if (notificationType === NotificationType.AnswerComment) {
      const queryParams = `${notificationType}=true&questionId=${comment?.question?.id}`;
      if (comment?.question?.questionnaireTicket?.user.id === otherUser?.id) {
        const ticketId = comment?.question?.questionnaireTicket.id;
        return `${NavigationPaths.ServerQuestionnaires}/${ticketId}?${queryParams}`;
      }
      return `${NavigationPaths.VibeCheck}?${queryParams}`;
    }
    if (
      notificationType === NotificationType.AnswerLike ||
      notificationType === NotificationType.VerifyUser ||
      notificationType === NotificationType.DenyUserVerification
    ) {
      return NavigationPaths.VibeCheck;
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

  const handleRead = async () => {
    setMenuAnchorEl(null);
    if (isRead) {
      return;
    }

    // Update cache optimistically
    client.cache.updateQuery<UnreadNotificationsQuery>(
      { query: UnreadNotificationsDocument },
      (notificationsData) =>
        produce(notificationsData, (draft) => {
          if (!draft) {
            return;
          }
          draft.unreadNotificationsCount -= 1;
        }),
    );

    await updateNotification({
      variables: {
        notificationData: { id, status: NotificationStatus.Read },
      },
    });
  };

  const renderIcon = () => {
    if (
      notificationType === NotificationType.ProposalVoteReservations ||
      notificationType === NotificationType.QuestionnaireTicketVoteReservations
    ) {
      return <ThumbsUpDown sx={{ ...iconStyles, marginTop: 0.55 }} />;
    }
    if (
      notificationType === NotificationType.ProposalVoteStandAside ||
      notificationType === NotificationType.QuestionnaireTicketVoteStandAside
    ) {
      return <ThumbDown sx={iconStyles} />;
    }
    if (
      notificationType === NotificationType.ProposalVoteBlock ||
      notificationType === NotificationType.QuestionnaireTicketVoteBlock
    ) {
      return <PanTool sx={iconStyles} />;
    }
    if (
      notificationType === NotificationType.QuestionnaireTicketVoteAgreement ||
      notificationType === NotificationType.ProposalVoteAgreement ||
      notificationType === NotificationType.CommentLike ||
      notificationType === NotificationType.AnswerLike ||
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
      return <CommentSharp sx={{ ...iconStyles, marginTop: 0.6 }} />;
    }
    if (notificationType === NotificationType.NewMessage) {
      return <MessageRounded sx={{ ...iconStyles, marginTop: 0.6 }} />;
    }
    if (notificationType === NotificationType.Follow) {
      return <Person sx={iconStyles} />;
    }
    if (
      notificationType === NotificationType.AddToDefaultGroup ||
      notificationType === NotificationType.GroupMemberRequest ||
      notificationType === NotificationType.GroupMemberRequestApproval
    ) {
      return <Group sx={iconStyles} />;
    }
    if (
      notificationType === NotificationType.QuestionnaireTicketSubmitted ||
      notificationType === NotificationType.NewQuestionnaireTicket ||
      notificationType === NotificationType.DenyUserVerification
    ) {
      return <QuestionAnswer sx={{ ...iconStyles, marginTop: 0.65 }} />;
    }
    if (notificationType === NotificationType.VerifyUser) {
      return <Verified sx={{ ...iconStyles, fontSize: 12, marginTop: 0.45 }} />;
    }
    return <AutoAwesome sx={{ ...iconStyles, marginTop: 0.55 }} />;
  };

  return (
    <Flex
      paddingX="16px"
      paddingTop={isFirst ? '16px' : '8px'}
      paddingBottom={isLast ? '16px' : '8px'}
      alignItems="center"
      justifyContent="space-between"
      bgcolor={isRead ? 'transparent' : 'rgba(88, 101, 242, 0.1)'}
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
        <MenuItem onClick={handleRead} disabled={isRead}>
          <Check fontSize="small" sx={{ marginRight: 1 }} />
          {t('notifications.labels.markAsRead')}
        </MenuItem>
      </ItemMenu>
    </Flex>
  );
};

export default Notification;
