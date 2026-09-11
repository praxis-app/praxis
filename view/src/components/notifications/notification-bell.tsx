import { NotificationInbox } from '@/components/notifications/notification-inbox';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserSettingsSections } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useNotifications } from '@/hooks/use-notifications';
import { useServerData } from '@/hooks/use-server-data';
import { getNotificationTargetRoute } from '@/lib/notification.utils';
import { cn } from '@/lib/shared.utils';
import { getUserSettingsPath } from '@/lib/user-settings.utils';
import { type NotificationRes } from '@/types/notification.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuBell } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { serverSlug } = useServerData();
  const { enabled, unreadCount, markRead } = useNotifications();

  if (!enabled || !serverSlug) return null;

  // Skip the close animation when leaving, so it cannot paint over the new page
  const closeAndNavigate = (path: string, state?: unknown) => {
    setIsLeaving(true);
    setIsOpen(false);
    void navigate(path, { state });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsLeaving(false);
    }
    setIsOpen(open);
  };

  const openSettings = () => {
    closeAndNavigate(getUserSettingsPath(UserSettingsSections.Notifications));
  };

  const selectNotification = (notification: NotificationRes) => {
    const route = getNotificationTargetRoute(notification, serverSlug);
    if (!route) {
      return;
    }
    if (!notification.readAt) {
      markRead(notification);
    }
    closeAndNavigate(route.path, route.state);
  };

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={t('notifications.actions.open', { count: unreadCount })}
      data-testid="notification-bell"
    >
      <LuBell className="size-5" />
      {unreadCount > 0 && (
        <span
          data-testid="notification-count"
          className="bg-primary text-primary-foreground ring-background absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] leading-4.5 font-semibold ring-2"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('notifications.title')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent
          align="end"
          className={cn(
            'flex max-h-[min(36rem,calc(100vh-5rem))] w-96 overflow-hidden p-0',
            isLeaving && 'invisible',
          )}
        >
          <NotificationInbox
            onSelect={selectNotification}
            onOpenSettings={openSettings}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        hideCloseButton
        className={cn(
          'flex max-h-[82dvh] gap-0 rounded-t-xl p-0',
          isLeaving && 'invisible',
        )}
      >
        <SheetTitle className="sr-only">{t('notifications.title')}</SheetTitle>
        <SheetDescription className="sr-only">
          {t('notifications.labels.unreadCount', { count: unreadCount })}
        </SheetDescription>
        <NotificationInbox
          onSelect={selectNotification}
          onOpenSettings={openSettings}
          onClose={() => setIsOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
