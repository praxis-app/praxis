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
  Reply,
  ThumbDown,
  ThumbUp,
  ThumbsUpDown,
  Verified,
} from '@mui/icons-material';
import { Box, MenuItem, SxProps, Typography, useTheme } from '@mui/material';
import { produce } from 'immer';
import { truncate } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NotificationStatus,
  NotificationType,
} from '../../constants/notifications.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { VOTE_BADGE_STYLES } from '../../constants/vote.constants';
import { VibeChatDocument } from '../../graphql/chat/queries/gen/VibeChat.gen';
import { GroupChatDocument } from '../../graphql/groups/queries/gen/GroupChat.gen';
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
    if (notificationType === NotificationType.NewMessage) {
      if (!conversation?.name) {
        return t('notifications.errors.accessDenied');
      }
      return t('notifications.messages.newMessage', {
        chatName: conversation.group?.name || conversation?.name,
        count: Number(unreadMessageCount),
      });
    }
    if (notificationType === NotificationType.Follow) {
      return t('notifications.messages.follow', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.PostLike) {
      return t('notifications.messages.postLike', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.PostShare) {
      return t('notifications.messages.postShare', {
        name: otherUserName,
      });
    }
    if (isProposalVote) {
      return t('notifications.messages.proposalVote', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.ProposalRatification) {
      if (!group) {
        return t('notifications.messages.proposalRatified');
      }
      return t('notifications.messages.groupProposalRatified', {
        groupName: group.name,
      });
    }
    if (notificationType === NotificationType.ProposalComment) {
      return t('notifications.messages.proposalComment', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.ProposalShare) {
      return t('notifications.messages.proposalShare', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.PostComment) {
      return t('notifications.messages.postComment', {
        name: otherUserName,
      });
    }
    if (isQuestionnaireTicketVote) {
      return t('notifications.messages.questionnaireTicketVote', {
        name: otherUserName,
        ticketNumber: questionnaireTicket?.id,
      });
    }
    if (notificationType === NotificationType.QuestionnaireTicketComment) {
      if (!comment?.questionnaireTicket?.id) {
        return t('notifications.errors.accessDenied');
      }
      if (comment?.questionnaireTicket?.user.id === otherUser?.id) {
        return t('notifications.messages.ownQuestionnaireTicketComment', {
          name: otherUserName,
        });
      }
      return t('notifications.messages.questionnaireTicketComment', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.QuestionnaireTicketSubmitted) {
      return t('notifications.messages.questionnaireTicketSubmitted', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.AnswerComment) {
      if (comment?.question?.questionnaireTicket?.user.id === otherUser?.id) {
        return t('notifications.messages.ownAnswerComment', {
          name: otherUserName,
        });
      }
      return t('notifications.messages.answerComment', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.AnswerLike) {
      if (!question?.answer?.text) {
        return t('notifications.messages.missingAnswerLike', {
          name: otherUserName,
        });
      }
      return t('notifications.messages.answerLike', {
        name: otherUserName,
        text: `"${truncate(question?.answer?.text, { length: 30 })}"`,
      });
    }
    if (notificationType === NotificationType.CommentLike) {
      if (comment?.body) {
        return t('notifications.messages.commentLikeWithText', {
          name: otherUserName,
          text: `"${truncate(comment?.body, { length: 30 })}"`,
        });
      }
      return t('notifications.messages.commentLike', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.GroupMemberRequest) {
      return t('notifications.messages.groupMemberRequest', {
        name: otherUserName,
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.GroupMemberRequestApproval) {
      return t('notifications.messages.groupMemberRequestApproval', {
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.AddToDefaultGroup) {
      return t('notifications.messages.addToDefaultGroup', {
        groupName: group?.name,
      });
    }
    if (notificationType === NotificationType.NewQuestionnaireTicket) {
      return t('notifications.messages.newQuestionnaireTicket', {
        name: otherUserName,
      });
    }
    if (notificationType === NotificationType.VerifyUser) {
      return t('notifications.messages.verifyUser');
    }
    if (notificationType === NotificationType.DenyUserVerification) {
      return t('notifications.messages.denyUserVerification');
    }
    return t('notifications.errors.invalidType');
  };

  const getPath = () => {
    if (notificationType === NotificationType.NewMessage) {
      if (!conversation?.group) {
        return NavigationPaths.VibeChat;
      }
      const { group } = conversation;
      return `${NavigationPaths.Groups}/${group.name}${NavigationPaths.Chat}`;
    }
    if (
      isProposalVote ||
      notificationType === NotificationType.ProposalComment ||
      notificationType === NotificationType.ProposalRatification
    ) {
      return `${NavigationPaths.Proposals}/${proposal?.id}`;
    }
    if (
      notificationType === NotificationType.PostLike ||
      notificationType === NotificationType.PostShare ||
      notificationType === NotificationType.PostComment ||
      notificationType === NotificationType.ProposalShare
    ) {
      return `${NavigationPaths.Posts}/${post?.id}`;
    }
    if (notificationType === NotificationType.CommentLike) {
      if (comment?.question) {
        const queryParams = `${notificationType}=true&questionId=${comment.question.id}`;
        if (comment.question.questionnaireTicket.user.id === otherUser?.id) {
          const { id } = comment.question.questionnaireTicket;
          return `${NavigationPaths.VibeChecks}/${id}?${queryParams}`;
        }
        return `${NavigationPaths.MyVibeCheck}?${queryParams}`;
      }
      if (comment?.questionnaireTicket) {
        if (comment.questionnaireTicket.user.id === otherUser?.id) {
          const { id } = comment.questionnaireTicket;
          const queryParam = `${notificationType}=true`;
          return `${NavigationPaths.VibeChecks}/${id}?${queryParam}`;
        }
        return NavigationPaths.MyVibeCheck;
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
        return `${NavigationPaths.VibeChecks}/${ticketId}?${queryParam}`;
      }
      return NavigationPaths.MyVibeCheck;
    }
    if (
      notificationType === NotificationType.QuestionnaireTicketSubmitted ||
      notificationType === NotificationType.NewQuestionnaireTicket ||
      isQuestionnaireTicketVote
    ) {
      return `${NavigationPaths.VibeChecks}/${questionnaireTicket?.id}`;
    }
    if (notificationType === NotificationType.AnswerComment) {
      const queryParams = `${notificationType}=true&questionId=${comment?.question?.id}`;
      if (comment?.question?.questionnaireTicket?.user.id === otherUser?.id) {
        const ticketId = comment?.question?.questionnaireTicket.id;
        return `${NavigationPaths.VibeChecks}/${ticketId}?${queryParams}`;
      }
      return `${NavigationPaths.MyVibeCheck}?${queryParams}`;
    }
    if (
      notificationType === NotificationType.AnswerLike ||
      notificationType === NotificationType.VerifyUser ||
      notificationType === NotificationType.DenyUserVerification
    ) {
      return NavigationPaths.MyVibeCheck;
    }
    return NavigationPaths.Home;
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

          // Set document title to reflect unread count
          if (draft.unreadNotificationsCount === 0) {
            document.title = t('brand');
          } else {
            document.title = `(${draft.unreadNotificationsCount}) ${t(
              'brand',
            )}`;
          }
        }),
    );

    await updateNotification({
      variables: {
        notificationData: { id, status: NotificationStatus.Read },
      },
    });
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

  const refetchQueries = async () => {
    if (notificationType === NotificationType.NewMessage) {
      if (conversation?.group) {
        const groupChat = client.cache.readQuery({
          query: GroupChatDocument,
          variables: { limit: 20, offset: 0, name: conversation.group.name },
        });
        if (groupChat) {
          await client.refetchQueries({ include: [GroupChatDocument] });
        }
        return;
      }
      const vibeChat = client.cache.readQuery({
        query: VibeChatDocument,
        variables: { limit: 20, offset: 0 },
      });
      if (vibeChat) {
        await client.refetchQueries({ include: [VibeChatDocument] });
      }
    }
  };

  const handleClick = async () => {
    await refetchQueries();
    await handleRead();
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
    if (
      notificationType === NotificationType.PostShare ||
      notificationType === NotificationType.ProposalShare
    ) {
      return (
        <Reply
          sx={{
            ...iconStyles,
            transform: 'rotateY(180deg)',
            fontSize: 13,
            marginTop: 0.3,
          }}
        />
      );
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

  const renderAvatar = () => {
    if (otherUser) {
      return <UserAvatar user={otherUser} />;
    }
    if (group) {
      return <GroupAvatar group={group} withLink={false} />;
    }
    return <UserAvatar />;
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
        onClick={handleClick}
        sx={{
          marginRight: '5px',
          display: 'flex',
          gap: '13px',
          flex: 1,
        }}
      >
        <Box position="relative">
          {renderAvatar()}
          <Box sx={iconContainerStyles}>{renderIcon()}</Box>
        </Box>

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
