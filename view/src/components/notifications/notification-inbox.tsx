import { NotificationItem } from '@/components/notifications/notification-item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useNotifications } from '@/hooks/use-notifications';
import { type NotificationRes } from '@/types/notification.types';
import { useTranslation } from 'react-i18next';
import { LuBell, LuRefreshCw, LuSettings, LuTrash2, LuX } from 'react-icons/lu';

interface Props {
  onSelect: (notification: NotificationRes) => void;
  onOpenSettings: () => void;
  onClose?: () => void;
}

export const NotificationInbox = ({
  onSelect,
  onOpenSettings,
  onClose,
}: Props) => {
  const { t } = useTranslation();

  const {
    notifications,
    unreadCount,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    markRead,
    markUnread,
    deleteNotification,
    markAllRead,
    clearAll,
  } = useNotifications();

  const listBottomRef = useInfiniteScroll({
    hasNextPage,
    isLoadingMore: isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label={t('notifications.title')}
    >
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">{t('notifications.title')}</h2>
          <p className="text-muted-foreground text-xs">
            {t('notifications.labels.unreadCount', { count: unreadCount })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!unreadCount}
            onClick={markAllRead}
          >
            {t('notifications.actions.markAllRead')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!notifications.length}
            onClick={clearAll}
            aria-label={t('notifications.actions.clearAll')}
          >
            <LuTrash2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            aria-label={t('notifications.actions.settings')}
          >
            <LuSettings />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t('notifications.actions.close')}
            >
              <LuX />
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isPending && (
          <div className="space-y-4 p-4" aria-label={t('actions.loading')}>
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex h-full min-h-60 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-muted-foreground text-sm">
              {t('notifications.errors.load')}
            </p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <LuRefreshCw />
              {t('actions.refresh')}
            </Button>
          </div>
        )}

        {!isPending && !isError && !notifications.length && (
          <div className="flex h-full min-h-60 flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="bg-muted flex size-11 items-center justify-center rounded-full">
              <LuBell className="text-muted-foreground size-5" />
            </div>
            <p className="font-medium">{t('notifications.empty.title')}</p>
            <p className="text-muted-foreground max-w-64 text-sm">
              {t('notifications.empty.description')}
            </p>
          </div>
        )}

        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isLast={index === notifications.length - 1}
            onSelect={onSelect}
            onMarkRead={markRead}
            onMarkUnread={markUnread}
            onDelete={deleteNotification}
          />
        ))}
        <div ref={listBottomRef} className="h-px" />
        {isFetchingNextPage && (
          <p className="text-muted-foreground py-3 text-center text-xs">
            {t('actions.loading')}
          </p>
        )}
      </div>
    </section>
  );
};
