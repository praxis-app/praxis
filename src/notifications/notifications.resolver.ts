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
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { User } from '../users/models/user.model';
import { Notification } from './models/notification.model';
import { UpdateNotificationInput } from './models/update-notification.input';
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

  // TODO: Add data loader for batching otherUser queries
  @ResolveField(() => User, { nullable: true })
  otherUser(@Parent() { id }: Notification) {
    return this.notificationsService.getOtherUser(id);
  }

  // TODO: Add data loader for batching otherUser queries
  @ResolveField(() => Proposal, { nullable: true })
  proposal(@Parent() { id }: Notification) {
    return this.notificationsService.getProposal(id);
  }

  // TODO: Add data loader for batching otherUser queries
  @ResolveField(() => Post, { nullable: true })
  post(@Parent() { id }: Notification) {
    return this.notificationsService.getPost(id);
  }

  @Mutation(() => Notification)
  updateNotification(
    @Args('notificationData') notificationData: UpdateNotificationInput,
  ) {
    return this.notificationsService.updateNotification(notificationData);
  }

  @Mutation(() => Boolean)
  deleteNotification(@Args('id', { type: () => Int }) id: number) {
    return this.notificationsService.deleteNotification(id);
  }

  @Subscription(() => Notification)
  notification(@CurrentUser() user: User) {
    return this.pubSub.asyncIterator(`user-notification-${user.id}`);
  }
}
