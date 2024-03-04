import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { Notification } from '../../notifications/models/notification.model';
import { UpdateNotificationInput } from '../../notifications/models/update-notification.input';

export const isOwnNotification = rule({ cache: 'strict' })(async (
  parent: Notification | undefined,
  args: { notificationData: UpdateNotificationInput } | { id: number } | object,
  { user, services: { notificationsService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if (parent && 'id' in parent) {
    return notificationsService.isOwnNotification(parent.id, user.id);
  }
  if ('id' in args) {
    return notificationsService.isOwnNotification(args.id, user.id);
  }
  if (!('notificationData' in args)) {
    return false;
  }
  return notificationsService.isOwnNotification(
    args.notificationData.id,
    user.id,
  );
});
