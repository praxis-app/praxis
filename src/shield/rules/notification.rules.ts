import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { UpdateNotificationInput } from '../../notifications/models/update-notification.input';

export const isOwnNotification = rule({ cache: 'strict' })(async (
  _parent,
  args: { notificationData: UpdateNotificationInput },
  { user, services: { notificationsService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return notificationsService.isOwnNotification(
    args.notificationData.id,
    user.id,
  );
});
