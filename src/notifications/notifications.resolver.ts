import { Inject } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Group } from '../groups/models/group.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { User } from '../users/models/user.model';
import { BulkUpdateNotificationsInput } from './models/bulk-update-notifications.input';
import { BulkUpdateNotificationsPayload } from './models/bulk-update-notifications.payload';
import { Notification } from './models/notification.model';
import { UpdateNotificationInput } from './models/update-notification.input';
import { UpdateNotificationPayload } from './models/update-notification.payload';
import { NotificationStatus } from './notifications.constants';
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
    return this.notificationsService.getNotificationsCount({ userId: user.id });
  }

  @Query(() => Int)
  unreadNotificationsCount(@CurrentUser() user: User) {
    return this.notificationsService.getNotificationsCount({
      status: NotificationStatus.Unread,
      userId: user.id,
    });
  }

  // TODO: Add data loader for batching queries
  @ResolveField(() => User, { nullable: true })
  otherUser(@Parent() { id }: Notification) {
    return this.notificationsService.getOtherUser(id);
  }

  // TODO: Add data loader for batching queries
  @ResolveField(() => Group, { nullable: true })
  group(@Parent() { id }: Notification) {
    return this.notificationsService.getGroup(id);
  }

  // TODO: Add data loader for batching queries
  @ResolveField(() => Proposal, { nullable: true })
  proposal(@Parent() { id }: Notification) {
    return this.notificationsService.getProposal(id);
  }

  // TODO: Add data loader for batching queries
  @ResolveField(() => Post, { nullable: true })
  post(@Parent() { id }: Notification) {
    return this.notificationsService.getPost(id);
  }

  @Mutation(() => UpdateNotificationPayload)
  updateNotification(
    @Args('notificationData') notificationData: UpdateNotificationInput,
  ) {
    return this.notificationsService.updateNotification(notificationData);
  }

  @Mutation(() => BulkUpdateNotificationsPayload)
  bulkUpdateNotifications(
    @Args('notificationsData') notificationsData: BulkUpdateNotificationsInput,
  ) {
    return this.notificationsService.bulkUpdateNotifications(notificationsData);
  }

  @Mutation(() => Boolean)
  deleteNotification(@Args('id', { type: () => Int }) id: number) {
    return this.notificationsService.deleteNotification(id);
  }

  @Mutation(() => Boolean)
  clearNotifications(@CurrentUser() user: User) {
    return this.notificationsService.clearNotifications(user.id);
  }

  @Subscription(() => Notification)
  notification(@CurrentUser() user: User) {
    return this.pubSub.asyncIterator(`user-notification-${user.id}`);
  }
}
