import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { UpdateNotificationInput } from '../../notifications/models/update-notification.input';

export const isOwnNotification = rule({ cache: 'strict' })(async (
  _parent,
  args: { notificationData: UpdateNotificationInput } | { id: number },
  { user, services: { notificationsService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  const notificationId = 'id' in args ? args.id : args.notificationData.id;
  return notificationsService.isOwnNotification(notificationId, user.id);
});
