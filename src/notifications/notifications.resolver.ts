import { Inject } from '@nestjs/common';
import { Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { Notification } from './models/notification.model';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(@Inject('PUB_SUB') private pubSub: PubSub) {}

  @Subscription(() => Notification)
  notifications(@CurrentUser() user: User) {
    return this.pubSub.asyncIterator(`user-notification-${user.id}`);
  }
}
