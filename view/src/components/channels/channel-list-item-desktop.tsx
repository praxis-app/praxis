import { useAbility } from '@/hooks/use-ability';
import { useUnreadChannels } from '@/hooks/use-unread-channels';
import { cn } from '@/lib/shared.utils';
import { truncate } from '@/lib/text.utils';
import { type ChannelRes } from '@/types/channel.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdForum, MdSettings, MdTag } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DeleteChannelForm,
  DeleteChannelFormSubmitButton,
} from './delete-channel-form';

interface Props {
  channel: ChannelRes;
  isActive: boolean;
  serverSlug: string;
}

export const ChannelListItemDesktop = ({
  channel,
  isActive,
  serverSlug,
}: Props) => {
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { serverAbility } = useAbility();
  const { unreadChannelIds } = useUnreadChannels();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const canManageChannels = serverAbility.can('manage', 'Channel');
  const hasUnread = unreadChannelIds.includes(channel.id);
  const showSettingsBtn = canManageChannels && (isHovering || isActive);

  const channelPath = `/s/${serverSlug}/c/${channel.id}`;
  const settingsPath = `${channelPath}/settings`;

  const truncatedChannelName = truncate(
    channel.name,
    isHovering || isActive ? 21 : 23,
  );
  const ChannelIcon = channel.channelType === 'forum' ? MdForum : MdTag;

  return (
    <Dialog
      open={showDeleteChannelDialog}
      onOpenChange={setShowDeleteChannelDialog}
    >
      <ContextMenu modal={false}>
        <ContextMenuTrigger disabled={!canManageChannels}>
          <div
            className={cn(
              'text-muted-foreground hover:bg-foreground/10 active:bg-foreground/15 dark:hover:bg-accent dark:active:bg-accent/80 relative mx-2 flex items-center justify-between rounded-lg pr-2.5',
              isActive && 'bg-foreground/10 text-foreground dark:bg-accent',
            )}
            key={channel.id}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {hasUnread && (
              <span
                className="bg-foreground absolute top-1/2 -left-2 h-2 w-1 -translate-y-1/2 rounded-r-full"
                data-testid="channel-unread-indicator"
                aria-hidden
              />
            )}
            <Link
              to={channelPath}
              className="mr-1.5 flex flex-1 items-center gap-2 py-[0.225rem] pl-2"
              aria-current={isActive ? 'page' : undefined}
            >
              <ChannelIcon className="size-6" />
              <div
                className={cn(
                  'text-[0.925rem]',
                  hasUnread && 'text-foreground font-medium',
                )}
              >
                {truncatedChannelName}
              </div>
            </Link>
            {showSettingsBtn && (
              <Link to={settingsPath}>
                <MdSettings
                  className={cn(
                    'hover:text-foreground text-muted-foreground size-4.5',
                    isActive && 'text-foreground',
                  )}
                />
              </Link>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          {canManageChannels && (
            <ContextMenuItem onClick={() => navigate(settingsPath)}>
              {t('channels.labels.channelSettings')}
            </ContextMenuItem>
          )}

          {canManageChannels && (
            <DialogTrigger asChild>
              <ContextMenuItem className="text-destructive">
                {t('channels.actions.delete')}
              </ContextMenuItem>
            </DialogTrigger>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('channels.actions.delete')}</DialogTitle>
          <DialogDescription className="pt-3.5">
            {t('prompts.deleteItem', {
              itemType: t('channels.labels.channel'),
            })}
          </DialogDescription>
        </DialogHeader>

        <DeleteChannelForm
          channel={channel}
          submitButton={(props) => (
            <DialogFooter>
              <DeleteChannelFormSubmitButton {...props} />
            </DialogFooter>
          )}
          onSubmit={() => setShowDeleteChannelDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
