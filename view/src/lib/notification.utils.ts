import {
  type NotificationRes,
  type NotificationsPageRes,
} from '@/types/notification.types';
import { type InfiniteData } from '@tanstack/react-query';

export const NOTIFICATION_PAGE_SIZE = 25;

export interface NotificationTargetRoute {
  path: string;

  /** Focuses a decision in the channel feed, matching the decisions panel */
  state?: { decisionId: string };
}

export const getNotificationTargetRoute = (
  notification: NotificationRes,
  serverSlug: string,
): NotificationTargetRoute | null => {
  const { target } = notification;
  if (!target.available) return null;

  if (target.kind === 'serverRole') {
    return { path: `/s/${serverSlug}` };
  }
  if (target.kind === 'event' && target.eventId) {
    return { path: `/s/${serverSlug}/events/${target.eventId}` };
  }
  if (!target.channelId) return null;

  const channelPath = `/s/${serverSlug}/c/${target.channelId}`;
  if (target.forumPostId) {
    const reply =
      target.threadRootId && target.messageId
        ? `?reply=${target.messageId}`
        : '';
    return { path: `${channelPath}/posts/${target.forumPostId}${reply}` };
  }
  // The thread root stays focused in the feed behind the panel
  if (target.threadRootId) {
    const params = new URLSearchParams({ thread: target.threadRootId });
    if (target.messageId) {
      params.set('reply', target.messageId);
    }
    if (target.threadRootKind === 'poll') {
      params.set('threadKind', 'poll');
      return {
        path: `${channelPath}?${params}`,
        state: { decisionId: target.threadRootId },
      };
    }
    params.set('message', target.threadRootId);
    return { path: `${channelPath}?${params}` };
  }
  if (target.pollId) {
    return { path: channelPath, state: { decisionId: target.pollId } };
  }
  if (target.messageId) {
    return { path: `${channelPath}?message=${target.messageId}` };
  }
  return { path: channelPath };
};

export type NotificationsInfiniteData = InfiniteData<
  NotificationsPageRes,
  string | undefined
>;

const cursorFor = (notification: NotificationRes) =>
  `${notification.createdAt}|${notification.id}`;

/**
 * Restores the page-size invariant after an insert. Each page is trimmed back
 * to NOTIFICATION_PAGE_SIZE and its overflow cascades into the page after it.
 * Overflow off the final page is dropped and turned into a cursor instead, so
 * the pushed-out rows come back on the next fetch rather than being lost
 */
const boundPages = (pages: NotificationsPageRes[]) => {
  let carry: NotificationRes[] = [];

  return pages.map((page, index) => {
    const combined = [...carry, ...page.notifications];
    const notifications = combined.slice(0, NOTIFICATION_PAGE_SIZE);
    carry = combined.slice(NOTIFICATION_PAGE_SIZE);

    const boundary = notifications[notifications.length - 1];
    if (index < pages.length - 1 || !carry.length || !boundary) {
      return { ...page, notifications };
    }
    carry = [];
    return {
      ...page,
      notifications,
      nextCursor: cursorFor(boundary),
      hasMore: true,
    };
  });
};

const mapPages = (
  data: NotificationsInfiniteData | undefined,
  transform: (notifications: NotificationRes[]) => NotificationRes[],
) => {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      notifications: transform(page.notifications),
    })),
  };
};

/** Moves the notification to the top of the list, inserting it when it is new */
export const upsertNotification = (
  data: NotificationsInfiniteData | undefined,
  notification: NotificationRes,
) => {
  if (!data?.pages[0]) return data;

  const withoutItem = mapPages(data, (notifications) =>
    notifications.filter((item) => item.id !== notification.id),
  );
  if (!withoutItem?.pages[0]) return data;

  const pages = [...withoutItem.pages];
  pages[0] = {
    ...pages[0],
    notifications: [notification, ...pages[0].notifications],
  };
  return { ...withoutItem, pages: boundPages(pages) };
};

export const removeNotifications = (
  data: NotificationsInfiniteData | undefined,
  notificationIds: string[],
) => {
  if (!notificationIds.length) return data;
  const removed = new Set(notificationIds);
  return mapPages(data, (notifications) =>
    notifications.filter((notification) => !removed.has(notification.id)),
  );
};

export const mapNotification = (
  data: NotificationsInfiniteData | undefined,
  notificationId: string,
  transform: (notification: NotificationRes) => NotificationRes,
) =>
  mapPages(data, (notifications) =>
    notifications.map((notification) =>
      notification.id === notificationId
        ? transform(notification)
        : notification,
    ),
  );

export const flattenNotificationPages = (
  data: { pages: NotificationsPageRes[] } | undefined,
) =>
  Array.from(
    new Map(
      data?.pages
        .flatMap((page) => page.notifications)
        .map((notification) => [notification.id, notification]),
    ).values(),
  );
