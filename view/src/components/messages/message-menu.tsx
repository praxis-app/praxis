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
import { MdLink, MdMoreHoriz } from 'react-icons/md';

interface Props {
  onOpenThread: () => void;
  onCopyThreadLink: () => void;
  onCopyText?: () => void;
}

export const MessageMenu = ({
  onOpenThread,
  onCopyThreadLink,
  onCopyText,
}: Props) => {
  const { deferUntilClosed, runPendingAction } = useDeferredMenuAction();

  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t('messages.actions.openMenu')}
          className="bg-background/95 absolute -top-1 right-0 z-10 size-8 opacity-0 shadow-sm transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 motion-reduce:transition-none"
        >
          <MdMoreHoriz className="text-muted-foreground size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onCloseAutoFocus={runPendingAction}>
        <DropdownMenuItem onSelect={deferUntilClosed(onOpenThread)}>
          <LuReply />
          {t('messages.actions.reply')}
        </DropdownMenuItem>
        {onCopyText && (
          <DropdownMenuItem onSelect={onCopyText}>
            <LuCopy />
            {t('messages.actions.copyText')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onCopyThreadLink}>
          <MdLink />
          {t('messages.actions.copyLink')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
