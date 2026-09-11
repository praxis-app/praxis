import { AttachedImageList } from '@/components/images/attached-image-list';
import { FormattedText } from '@/components/shared/formatted-text';
import { MessageContextMenu } from '@/components/messages/message-context-menu';
import { MessageMenu } from '@/components/messages/message-menu';
import { MessageThreadSummary } from '@/components/messages/message-thread-summary';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { FOCUS_HIGHLIGHT_TARGET_CLASS_NAME } from '@/constants/style.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { usePressHighlight } from '@/hooks/use-press-highlight';
import { copyMessageText } from '@/lib/message.utils';
import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import { type MessageRes } from '@/types/message.types';
import { useTranslation } from 'react-i18next';
import { truncate } from '../../lib/text.utils';
import { type CurrentUser } from '../../types/user.types';

interface Props {
  message: MessageRes;
  me?: CurrentUser;
  serverId?: string;
  channelId?: string;
  onOpenThread?: (rootMessageId: string) => void;
  onCopyThreadLink?: (rootMessageId: string) => void;
  onImageLoad?: () => void;
}

export const Message = ({
  message: {
    id,
    body,
    images,
    user,
    createdAt,
    replyCount,
    replyUsers,
    latestReplyAt,
  },
  serverId,
  channelId,
  me,
  onOpenThread,
  onCopyThreadLink,
  onImageLoad,
}: Props) => {
  const isDesktop = useIsDesktop();
  const { isPressed, pressHandlers } = usePressHighlight();

  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  const formattedDate = timeAgo(createdAt);
  const showImages = !!images?.length;

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);
  const hasThreadActions = !!onOpenThread && !!onCopyThreadLink;
  // The long press that opens the menu is the same gesture the browser uses to
  // start a text selection, so selection is turned off where that menu lives.
  // Radix already suppresses the iOS callout on its trigger
  const usesLongPressMenu = hasThreadActions && !isDesktop;
  const copyText = body ? () => copyMessageText(body) : undefined;

  const message = (
    <div
      data-message-id={id}
      tabIndex={-1}
      {...pressHandlers}
      className={cn(
        FOCUS_HIGHLIGHT_TARGET_CLASS_NAME,
        'group/message data-[state=open]:bg-accent -mx-2 flex min-w-0 scroll-m-3 gap-4 rounded-md px-2 pt-1 transition-colors duration-300 ease-out focus:outline-none motion-reduce:transition-none',
        isPressed && 'bg-accent',
        usesLongPressMenu && 'select-none',
      )}
    >
      {hasThreadActions && isDesktop && (
        <MessageMenu
          onOpenThread={() => onOpenThread(id)}
          onCopyThreadLink={() => onCopyThreadLink(id)}
          onCopyText={copyText}
        />
      )}

      <UserProfileDrawer
        name={truncatedUsername}
        userId={user.id}
        me={me}
        trigger={
          <button className="shrink-0 cursor-pointer self-start">
            <UserAvatar
              name={name}
              userId={user.id}
              className="mt-0.5"
              imageId={user.profilePicture?.id}
            />
          </button>
        }
      />

      <div className="max-w-full min-w-0 flex-1">
        <div className="mb-[-0.1rem] flex min-w-0 items-center gap-1.5">
          <UserProfileDrawer
            name={truncatedUsername}
            userId={user.id}
            me={me}
            trigger={
              <button className="cursor-pointer font-medium">
                {truncatedUsername}
              </button>
            }
          />
          <div className="text-muted-foreground text-sm font-light">
            {formattedDate}
          </div>
        </div>

        {/* TODO: Truncate message body if it exceeds a certain length */}
        {body && <FormattedText text={body} />}

        {/* TODO: Enable navigation between images in modal */}
        {showImages && (
          <AttachedImageList
            images={images}
            serverId={serverId}
            channelId={channelId}
            messageId={id}
            onImageLoad={onImageLoad}
            imageClassName="rounded-lg"
            className="w-full max-w-[min(350px,100%)] pt-1.5"
          />
        )}

        {!body && !showImages && (
          <div className="text-muted-foreground text-sm">
            {t('prompts.noContent')}
          </div>
        )}

        {onOpenThread && replyCount > 0 && (
          <MessageThreadSummary
            replyCount={replyCount}
            replyUsers={replyUsers || []}
            latestReplyAt={latestReplyAt}
            onOpen={() => onOpenThread(id)}
          />
        )}
      </div>
    </div>
  );

  // Touch devices get the same actions through a long press instead of a
  // permanently visible trigger on every message
  if (!hasThreadActions || isDesktop) {
    return message;
  }

  return (
    <MessageContextMenu
      onOpenThread={() => onOpenThread(id)}
      onCopyThreadLink={() => onCopyThreadLink(id)}
      onCopyText={copyText}
    >
      {message}
    </MessageContextMenu>
  );
};
