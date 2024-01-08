import { Field, ObjectType } from '@nestjs/graphql';

import { Notification } from './notification.model';

@ObjectType()
export class ReadNotificationsPayload {
  @Field(() => [Notification])
  notifications: Notification[];
}
