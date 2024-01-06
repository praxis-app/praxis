import { Inject } from '@nestjs/common';
import { Args, Int, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { Notification } from './models/notification.model';
import { NotificationsService } from './notifications.service';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,
    private notificationsService: NotificationsService,
  ) {}

  @Query(() => [Notification])
  notifications(
    @CurrentUser() user: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.notificationsService.getNotifications(user.id, offset, limit);
  }

  @Query(() => Int)
  notificationsCount(@CurrentUser() user: User) {
    return this.notificationsService.getNotificationsCount(user.id);
  }

  @Subscription(() => Notification)
  notification(@CurrentUser() user: User) {
    return this.pubSub.asyncIterator(`user-notification-${user.id}`);
  }
}
