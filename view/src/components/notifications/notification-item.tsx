import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/users/user-avatar';
import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import {
  type NotificationKind,
  type NotificationRes,
} from '@/types/notification.types';
import { useTranslation } from 'react-i18next';
import {
  LuBadgeCheck,
  LuCalendar,
  LuCheck,
  LuCircleMinus,
  LuEllipsis,
  LuMessageCircle,
  LuReply,
  LuTrash2,
} from 'react-icons/lu';
import {
  MdFrontHand,
  MdHowToVote,
  MdOutlineAddModerator,
  MdThumbDown,
  MdThumbUp,
} from 'react-icons/md';

interface Props {
  notification: NotificationRes;
  isLast?: boolean;
  onSelect: (notification: NotificationRes) => void;
  onMarkRead: (notification: NotificationRes) => void;
  onMarkUnread: (notification: NotificationRes) => void;
  onDelete: (notification: NotificationRes) => void;
}

type NotificationItemKey =
  | NotificationKind
  | 'new_message_forum'
  | 'message_reply_message'
  | 'message_reply_poll'
  | 'message_reply_proposal';

const REPLY_KEYS = {
  message: 'message_reply_message',
  poll: 'message_reply_poll',
  proposal: 'message_reply_proposal',
} as const;

/** Only threads that are not the viewer's own read as a conversation */
const getNotificationItemKey = (
  notification: NotificationRes,
): NotificationItemKey => {
  const { kind, target } = notification;

  if (kind === 'new_message' && target.forumPostId) {
    return 'new_message_forum';
  }
  if (kind === 'message_reply' && target.repliedTo) {
    return REPLY_KEYS[target.repliedTo];
  }
  return kind;
};

const getVoteIcon = (
  voteType: NotificationRes['voteType'],
  className: string,
) => {
  switch (voteType) {
    case 'agree':
      return <MdThumbUp className={cn(className, 'scale-90')} />;
    case 'disagree':
      return <MdThumbDown className={cn(className, '-mb-0.5 scale-90')} />;
    case 'block':
      return <MdFrontHand className={cn(className, '-mb-px scale-90')} />;
    case 'abstain':
      return <LuCircleMinus className={cn(className, '-mb-px scale-90')} />;
    default:
      return <MdHowToVote className={className} />;
  }
};

const getIcon = (notification: NotificationRes, className: string) => {
  switch (notification.kind) {
    case 'new_message':
      return <LuMessageCircle className={cn(className, 'scale-90')} />;
    case 'new_proposal':
      return <MdHowToVote className={className} />;
    case 'message_reply':
    case 'forum_reply':
      return <LuReply className={className} />;
    case 'proposal_vote':
      return getVoteIcon(notification.voteType, className);
    case 'proposal_ratified':
    case 'proposal_closed':
      return <LuBadgeCheck className={className} />;
    case 'server_role_granted':
      return (
        <MdOutlineAddModerator className={cn(className, '-mb-px scale-90')} />
      );
    case 'event_created':
      return <LuCalendar className={className} />;
    default:
      return <LuMessageCircle className={className} />;
  }
};

export const NotificationItem = ({
  notification,
  isLast = false,
  onSelect,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: Props) => {
  const { t } = useTranslation();

  const actorName =
    notification.actor?.displayName ||
    notification.actor?.name ||
    t('notifications.labels.system');

  const isUnread = !notification.readAt;
  const isAvailable = notification.target.available;
  const count = notification.unreadCount || 1;

  const itemKey = getNotificationItemKey(notification);

  const description = t(`notifications.items.${itemKey}`, {
    actor: actorName,
    channel: notification.target.channelName,
    role: notification.target.serverRoleName,
    event: notification.target.eventName,
    vote: notification.voteType
      ? t(`notifications.votes.${notification.voteType}`)
      : undefined,
    count,
  });

  return (
    <div
      data-testid="notification-item"
      data-unread={isUnread || undefined}
      className={cn(
        'group relative flex items-start gap-2 border-b px-3 py-3',
        isLast && 'border-b-0',
        isUnread &&
          'bg-primary/5 before:bg-primary before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full',
      )}
    >
      <div className="relative mt-0.5 shrink-0">
        {notification.actor ? (
          <UserAvatar
            className="size-9"
            fallbackClassName="text-sm"
            name={actorName}
            userId={notification.actor.id}
            imageId={notification.actor.profilePicture?.id}
          />
        ) : (
          <div className="bg-muted flex size-9 items-center justify-center rounded-full">
            {getIcon(notification, 'size-4.5 -translate-y-px')}
          </div>
        )}
        {notification.actor && (
          <span className="bg-background absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border shadow-sm">
            {getIcon(notification, 'size-3 -translate-y-px')}
          </span>
        )}
      </div>

      <button
        type="button"
        disabled={!isAvailable}
        onClick={() => onSelect(notification)}
        className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-default"
      >
        <p className={cn('text-sm leading-5', isUnread && 'font-medium')}>
          {description}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {isAvailable
            ? timeAgo(notification.createdAt)
            : t('notifications.labels.unavailable')}
        </p>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mt-1 size-8 shrink-0"
            aria-label={t('notifications.actions.openMenu')}
          >
            <LuEllipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              isUnread ? onMarkRead(notification) : onMarkUnread(notification)
            }
          >
            <LuCheck />
            {isUnread
              ? t('notifications.actions.markRead')
              : t('notifications.actions.markUnread')}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDelete(notification)}
          >
            <LuTrash2 />
            {t('notifications.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
