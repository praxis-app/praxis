import { api } from '@/client/api-client';
import { useAuthData } from '@/hooks/use-auth-data';
import { useResyncOnReturn } from '@/hooks/use-resync-on-return';
import { useServerData } from '@/hooks/use-server-data';
import { useSubscription } from '@/hooks/use-subscription';
import { getUnreadChannelsQueryKey } from '@/hooks/use-unread-channels';
import {
  flattenNotificationPages,
  mapNotification,
  NOTIFICATION_PAGE_SIZE,
  removeNotifications,
  upsertNotification,
  type NotificationsInfiniteData,
} from '@/lib/notification.utils';
import { notificationPubSubTopic } from '@/lib/pub-sub.utils';
import {
  type NotificationPayload,
  type NotificationRes,
  type UnreadNotificationCountRes,
} from '@/types/notification.types';
import { type PubSubMessage } from '@/types/shared.types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export const getNotificationsQueryKey = (
  userId?: string,
  serverId?: string,
) => ['notifications', userId, serverId];

export const getUnreadNotificationCountQueryKey = (
  userId?: string,
  serverId?: string,
) => [...getNotificationsQueryKey(userId, serverId), 'unread-count'];

export const useNotifications = () => {
  const { isRegistered, me } = useAuthData();
  const { serverId, currentUserHasNoServers } = useServerData();
  const queryClient = useQueryClient();

  const listKey = useMemo(
    () => getNotificationsQueryKey(me?.id, serverId),
    [me?.id, serverId],
  );
  const countKey = useMemo(
    () => getUnreadNotificationCountQueryKey(me?.id, serverId),
    [me?.id, serverId],
  );

  /** Narrows the current server for calls the queries' `enabled` gate cannot */
  const requireServerId = useCallback(() => {
    if (!serverId) {
      throw new Error('Current server not found');
    }
    return serverId;
  }, [serverId]);

  const setListData = useCallback(
    (
      updater: (
        current: NotificationsInfiniteData | undefined,
      ) => NotificationsInfiniteData | undefined,
    ) => queryClient.setQueryData<NotificationsInfiniteData>(listKey, updater),
    [listKey, queryClient],
  );

  const addToUnreadCount = useCallback(
    (delta: number) =>
      queryClient.setQueryData<UnreadNotificationCountRes>(
        countKey,
        (value) => ({
          unreadCount: Math.max(0, (value?.unreadCount || 0) + delta),
        }),
      ),
    [countKey, queryClient],
  );

  const invalidateUnreadCount = useCallback(
    () => queryClient.invalidateQueries({ queryKey: countKey, exact: true }),
    [countKey, queryClient],
  );

  const snapshot = useCallback(
    () => ({
      list: queryClient.getQueryData(listKey),
      count: queryClient.getQueryData(countKey),
    }),
    [countKey, listKey, queryClient],
  );

  const restore = useCallback(
    (previous?: ReturnType<typeof snapshot>) => {
      queryClient.setQueryData(listKey, previous?.list);
      queryClient.setQueryData(countKey, previous?.count);
    },
    [countKey, listKey, queryClient],
  );

  /** Drops loaded pages back to the first, so a stale tail cannot linger */
  const refresh = useCallback(async () => {
    if (!serverId) {
      return;
    }
    setListData((current) =>
      current
        ? {
            ...current,
            pages: current.pages.slice(0, 1),
            pageParams: current.pageParams.slice(0, 1),
          }
        : current,
    );
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: listKey, exact: true }),
      invalidateUnreadCount(),
    ]);
  }, [invalidateUnreadCount, listKey, queryClient, serverId, setListData]);

  const enabled =
    isRegistered && !!me && !!serverId && !currentUserHasNoServers;

  const notificationsQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({ pageParam }) =>
      api.getNotifications(
        requireServerId(),
        pageParam,
        NOTIFICATION_PAGE_SIZE,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor || undefined : undefined,
    enabled,
  });

  const unreadQuery = useQuery({
    queryKey: countKey,
    queryFn: () => api.getUnreadNotificationCount(requireServerId()),
    enabled,
  });

  const { readyState } = useSubscription(
    enabled ? notificationPubSubTopic(serverId, me?.id) : '',
    {
      enabled,
      onMessage: (event) => {
        const message: PubSubMessage<NotificationPayload & { type: string }> =
          JSON.parse(event.data);
        if (!message.body) {
          return;
        }
        if (message.body.type === 'notification-removed') {
          const { removedNotificationIds } = message.body;
          setListData((current) =>
            removeNotifications(current, removedNotificationIds || []),
          );
          void invalidateUnreadCount();
          return;
        }
        if (message.body.type !== 'notification') {
          return;
        }
        const { notification } = message.body;

        // A bell can be mounted twice, so only count a row the cache lacks
        const current =
          queryClient.getQueryData<NotificationsInfiniteData>(listKey);
        const alreadyUnread = current?.pages.some((page) =>
          page.notifications.some(
            (item) => item.id === notification.id && !item.readAt,
          ),
        );
        setListData(() => upsertNotification(current, notification));
        if (!alreadyUnread) {
          addToUnreadCount(1);
        }
        void invalidateUnreadCount();
        void queryClient.invalidateQueries({
          queryKey: getUnreadChannelsQueryKey(serverId),
        });
      },
    },
  );

  useResyncOnReturn(readyState, () => void refresh());

  const { mutate: setReadState } = useMutation({
    mutationFn: ({
      notification,
      read,
    }: {
      notification: NotificationRes;
      read: boolean;
    }) =>
      read
        ? api.markNotificationRead(requireServerId(), notification.id)
        : api.markNotificationUnread(requireServerId(), notification.id),
    onMutate: async ({ notification, read }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = snapshot();

      setListData((current) =>
        mapNotification(current, notification.id, (item) => ({
          ...item,
          readAt: read ? new Date().toISOString() : null,
        })),
      );
      if (!!notification.readAt !== read) {
        addToUnreadCount(read ? -1 : 1);
      }
      return previous;
    },
    onError: (_error, _variables, previous) => restore(previous),
    onSuccess: ({ notification, removedNotificationIds }) => {
      setListData((current) =>
        mapNotification(
          removeNotifications(current, removedNotificationIds || []),
          notification.id,
          () => notification,
        ),
      );
      if (removedNotificationIds?.length) {
        void refresh();
      }
    },
    onSettled: () => void invalidateUnreadCount(),
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: (notification: NotificationRes) =>
      api.deleteNotification(requireServerId(), notification.id),
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = snapshot();

      setListData((current) => removeNotifications(current, [notification.id]));
      if (!notification.readAt) {
        addToUnreadCount(-1);
      }
      return previous;
    },
    onError: (_error, _notification, previous) => restore(previous),
    onSettled: () => void invalidateUnreadCount(),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.markAllNotificationsRead(requireServerId()),
    onSuccess: () => void refresh(),
  });

  const { mutate: clearAll } = useMutation({
    mutationFn: () => api.clearNotifications(requireServerId()),
    onSuccess: () => void refresh(),
  });

  return {
    enabled,
    notifications: flattenNotificationPages(notificationsQuery.data),
    unreadCount: unreadQuery.data?.unreadCount || 0,
    isPending: notificationsQuery.isPending,
    isError: notificationsQuery.isError,
    hasNextPage: notificationsQuery.hasNextPage,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
    fetchNextPage: () => void notificationsQuery.fetchNextPage(),
    refetch: () => void notificationsQuery.refetch(),
    markRead: (notification: NotificationRes) =>
      setReadState({ notification, read: true }),
    markUnread: (notification: NotificationRes) =>
      setReadState({ notification, read: false }),
    deleteNotification,
    markAllRead: () => markAllRead(),
    clearAll: () => clearAll(),
  };
};
