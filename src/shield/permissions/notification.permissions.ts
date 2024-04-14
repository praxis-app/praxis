import { isAuthenticated } from '../rules/auth.rules';
import { isOwnNotification } from '../rules/notification.rules';

export const notificationPermissions = {
  Query: {
    notifications: isAuthenticated,
    notificationsCount: isAuthenticated,
    unreadNotificationsCount: isAuthenticated,
  },
  Mutation: {
    readNotifications: isAuthenticated,
    clearNotifications: isAuthenticated,
    updateNotification: isOwnNotification,
    deleteNotification: isOwnNotification,
  },
  Subscription: {
    notification: isAuthenticated,
  },
  ObjectTypes: {
    Notification: isOwnNotification,
    UpdateNotificationPayload: isAuthenticated,
  },
};
