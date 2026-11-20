import { MessageThreadSummary } from '@/components/messages/message-thread-summary';
import { RemovedContentNotice } from '@/components/moderation/removed-content-notice';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { FOCUS_HIGHLIGHT_TARGET_CLASS_NAME } from '@/constants/style.constants';
import { cn } from '@/lib/shared.utils';
import { truncate } from '@/lib/text.utils';
import { timeAgo } from '@/lib/time.utils';
import { type PollRes } from '@/types/poll.types';
import { type CurrentUser } from '@/types/user.types';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  poll: PollRes;
  me?: CurrentUser;
  children: ReactNode;
  canModerate: boolean;
  label?: string;
  onOpenThread?: () => void;
}

export const PollFeedItem = ({
  poll,
  me,
  children,
  canModerate,
  label,
  onOpenThread,
}: Props) => {
  const { t } = useTranslation();

  const concealed = !!poll.hiddenAt && !canModerate;
  const { user } = poll;
  const name = user.displayName || user.name;
  const truncatedName = truncate(name, 18);

  return (
    <article
      aria-label={concealed ? undefined : label}
      data-decision-id={poll.id}
      tabIndex={-1}
      className={cn(
        FOCUS_HIGHLIGHT_TARGET_CLASS_NAME,
        '-mx-2 flex min-w-0 scroll-m-3 gap-4 rounded-lg px-2 pt-1 focus:outline-none',
      )}
    >
      <UserProfileDrawer
        name={truncatedName}
        userId={user.id}
        me={me}
        trigger={
          <button className="shrink-0 cursor-pointer self-start">
            <UserAvatar
              name={name}
              userId={user.id}
              imageId={user.profilePicture?.id}
              className="mt-0.5"
            />
          </button>
        }
      />

      <div className="max-w-full min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5 pb-1">
          <UserProfileDrawer
            name={truncatedName}
            userId={user.id}
            me={me}
            trigger={
              <button className="cursor-pointer font-medium">
                {truncatedName}
              </button>
            }
          />
          <div className="text-muted-foreground text-sm">
            {timeAgo(poll.createdAt)}
          </div>
        </div>

        {concealed ? (
          <RemovedContentNotice
            label={t(
              poll.pollType === 'proposal'
                ? 'moderation.labels.proposalHidden'
                : 'moderation.labels.pollHidden',
            )}
          />
        ) : (
          children
        )}

        {onOpenThread && poll.replyCount > 0 && (
          <MessageThreadSummary
            replyCount={poll.replyCount}
            replyUsers={poll.replyUsers || []}
            latestReplyAt={poll.latestReplyAt}
            onOpen={onOpenThread}
          />
        )}
      </div>
    </article>
  );
};
