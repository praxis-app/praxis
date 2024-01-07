import { Field, ObjectType } from '@nestjs/graphql';

import { Notification } from './notification.model';

@ObjectType()
export class BulkUpdateNotificationsPayload {
  @Field(() => [Notification])
  notifications: Notification[];
}
