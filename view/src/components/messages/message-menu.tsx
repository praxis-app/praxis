import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeferredMenuAction } from '@/hooks/use-deferred-menu-action';
import { useTranslation } from 'react-i18next';
import { LuCopy, LuReply } from 'react-icons/lu';
import { MdDeleteOutline, MdLink, MdMoreHoriz } from 'react-icons/md';

interface Props {
  onOpenThread?: () => void;
  onCopyThreadLink?: () => void;
  onCopyText?: () => void;
  onRemove?: () => void;
  variant?: 'hover' | 'card';
}

export const MessageMenu = ({
  onOpenThread,
  onCopyThreadLink,
  onCopyText,
  onRemove,
  variant = 'hover',
}: Props) => {
  const { deferUntilClosed, runPendingAction } = useDeferredMenuAction();

  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'card' ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('messages.actions.openMenu')}
            className="absolute top-1/2 right-2 z-10 size-8 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            <MdMoreHoriz className="size-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t('messages.actions.openMenu')}
            className="bg-background/95 absolute -top-1 right-0 z-10 size-8 opacity-0 shadow-sm transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 motion-reduce:transition-none"
          >
            <MdMoreHoriz className="text-muted-foreground size-5" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onCloseAutoFocus={runPendingAction}>
        {onOpenThread && (
          <DropdownMenuItem onSelect={deferUntilClosed(onOpenThread)}>
            <LuReply />
            {t('messages.actions.reply')}
          </DropdownMenuItem>
        )}
        {onCopyText && (
          <DropdownMenuItem onSelect={onCopyText}>
            <LuCopy />
            {t('messages.actions.copyText')}
          </DropdownMenuItem>
        )}
        {onCopyThreadLink && (
          <DropdownMenuItem onSelect={onCopyThreadLink}>
            <MdLink />
            {t('messages.actions.copyLink')}
          </DropdownMenuItem>
        )}
        {onRemove && (
          <DropdownMenuItem
            variant="destructive"
            onSelect={deferUntilClosed(onRemove)}
          >
            <MdDeleteOutline />
            {t('moderation.actions.removeMessage')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
