import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useDeferredMenuAction } from '@/hooks/use-deferred-menu-action';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuCopy, LuReply } from 'react-icons/lu';
import { MdDeleteOutline, MdLink } from 'react-icons/md';

interface Props {
  children: ReactNode;
  onOpenThread?: () => void;
  onCopyThreadLink?: () => void;
  onCopyText?: () => void;
  onRemove?: () => void;
}

export const MessageContextMenu = ({
  children,
  onOpenThread,
  onCopyThreadLink,
  onCopyText,
  onRemove,
}: Props) => {
  const { deferUntilClosed, runPendingAction } = useDeferredMenuAction();

  const { t } = useTranslation();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent onCloseAutoFocus={runPendingAction}>
        {onOpenThread && (
          <ContextMenuItem onSelect={deferUntilClosed(onOpenThread)}>
            <LuReply />
            {t('messages.actions.reply')}
          </ContextMenuItem>
        )}
        {onCopyText && (
          <ContextMenuItem onSelect={onCopyText}>
            <LuCopy />
            {t('messages.actions.copyText')}
          </ContextMenuItem>
        )}
        {onCopyThreadLink && (
          <ContextMenuItem onSelect={onCopyThreadLink}>
            <MdLink />
            {t('messages.actions.copyLink')}
          </ContextMenuItem>
        )}
        {onRemove && (
          <ContextMenuItem
            variant="destructive"
            onSelect={deferUntilClosed(onRemove)}
          >
            <MdDeleteOutline />
            {t('moderation.actions.removeMessage')}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
