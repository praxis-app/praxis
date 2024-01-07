import { Field, ObjectType } from '@nestjs/graphql';

import { Notification } from './notification.model';

@ObjectType()
export class UpdateNotificationPayload {
  @Field()
  notification: Notification;
}
