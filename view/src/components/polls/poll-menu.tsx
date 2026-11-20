import { PollModerationDialog } from '@/components/moderation/poll-moderation-dialog';
import { PollModerationMenuItem } from '@/components/moderation/poll-moderation-menu-item';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeferredMenuAction } from '@/hooks/use-deferred-menu-action';
import { type PollRes } from '@/types/poll.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuReply } from 'react-icons/lu';
import { MdLink, MdMoreHoriz } from 'react-icons/md';

interface Props {
  poll: PollRes;
  channelId: string;
  canModerate: boolean;
  onOpenThread?: () => void;
  onCopyThreadLink?: () => void;
}

export const PollMenu = ({
  poll,
  channelId,
  canModerate,
  onOpenThread,
  onCopyThreadLink,
}: Props) => {
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const { deferUntilClosed, runPendingAction } = useDeferredMenuAction();

  const { t } = useTranslation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 size-8 text-gray-500 dark:text-gray-400"
            aria-label={t('polls.actions.openMenu')}
          >
            <MdMoreHoriz className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={runPendingAction}>
          {onOpenThread && (
            <DropdownMenuItem onSelect={deferUntilClosed(onOpenThread)}>
              <LuReply />
              {t('messages.actions.reply')}
            </DropdownMenuItem>
          )}
          {onCopyThreadLink && (
            <DropdownMenuItem onSelect={onCopyThreadLink}>
              <MdLink />
              {t('messages.actions.copyLink')}
            </DropdownMenuItem>
          )}
          {canModerate && (
            <PollModerationMenuItem
              poll={poll}
              onSelect={deferUntilClosed(() => setIsModerationOpen(true))}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canModerate && (
        <PollModerationDialog
          open={isModerationOpen}
          onOpenChange={setIsModerationOpen}
          poll={poll}
          channelId={channelId}
        />
      )}
    </>
  );
};
