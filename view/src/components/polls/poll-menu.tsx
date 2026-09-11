import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeferredMenuAction } from '@/hooks/use-deferred-menu-action';
import { useTranslation } from 'react-i18next';
import { LuReply } from 'react-icons/lu';
import { MdLink, MdMoreHoriz } from 'react-icons/md';

interface Props {
  onOpenThread: () => void;
  onCopyThreadLink: () => void;
}

export const PollMenu = ({ onOpenThread, onCopyThreadLink }: Props) => {
  const { deferUntilClosed, runPendingAction } = useDeferredMenuAction();

  const { t } = useTranslation();

  return (
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
        <DropdownMenuItem onSelect={deferUntilClosed(onOpenThread)}>
          <LuReply />
          {t('messages.actions.reply')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onCopyThreadLink}>
          <MdLink />
          {t('messages.actions.copyLink')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
