import { Inject } from '@nestjs/common';
import {
  Args,
  Context,
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
import { Conversation } from '../chat/models/conversation.model';
import { Comment } from '../comments/models/comment.model';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Group } from '../groups/models/group.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { User } from '../users/models/user.model';
import { Question } from '../vibe-check/models/question.model';
import { QuestionnaireTicket } from '../vibe-check/models/questionnaire-ticket.model';
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
    return this.notificationsService.getNotificationsByUserId(
      user.id,
      offset,
      limit,
    );
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

  @ResolveField(() => User, { nullable: true })
  otherUser(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { otherUserId }: Notification,
  ) {
    if (!otherUserId) {
      return null;
    }
    return loaders.usersLoader.load(otherUserId);
  }

  @ResolveField(() => Group, { nullable: true })
  group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Notification,
  ) {
    if (!groupId) {
      return null;
    }
    return loaders.groupsLoader.load(groupId);
  }

  @ResolveField(() => Proposal, { nullable: true })
  proposal(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { proposalId }: Notification,
  ) {
    if (!proposalId) {
      return null;
    }
    return loaders.proposalsLoader.load(proposalId);
  }

  @ResolveField(() => Post, { nullable: true })
  post(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { postId }: Notification,
  ) {
    if (!postId) {
      return null;
    }
    return loaders.postsLoader.load(postId);
  }

  @ResolveField(() => Comment, { nullable: true })
  comment(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { commentId }: Notification,
  ) {
    if (!commentId) {
      return null;
    }
    return loaders.commentsLoader.load(commentId);
  }

  @ResolveField(() => Conversation, { nullable: true })
  conversation(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { conversationId }: Notification,
  ) {
    if (!conversationId) {
      return null;
    }
    return loaders.conversationsLoader.load(conversationId);
  }

  @ResolveField(() => Question, { nullable: true })
  question(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { questionId }: Notification,
  ) {
    if (!questionId) {
      return null;
    }
    return loaders.questionsLoader.load(questionId);
  }

  @ResolveField(() => QuestionnaireTicket, { nullable: true })
  questionnaireTicket(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { questionnaireTicketId }: Notification,
  ) {
    if (!questionnaireTicketId) {
      return null;
    }
    return loaders.questionnaireTicketsLoader.load(questionnaireTicketId);
  }

  @Mutation(() => UpdateNotificationPayload)
  updateNotification(
    @Args('notificationData') { id, ...data }: UpdateNotificationInput,
  ) {
    return this.notificationsService.updateNotification(id, data);
  }

  @Mutation(() => Boolean)
  readNotifications(@CurrentUser() user: User) {
    return this.notificationsService.readNotifications(user.id);
  }

  @Mutation(() => Boolean)
  deleteNotification(@Args('id', { type: () => Int }) id: number) {
    return this.notificationsService.deleteNotification(id);
  }

  @Mutation(() => Boolean)
  clearNotifications(@CurrentUser() user: User) {
    return this.notificationsService.deleteNotifications({ userId: user.id });
  }

  @Subscription(() => Notification)
  notification(@CurrentUser() user: User) {
    return this.pubSub.asyncIterator(`user-notification-${user.id}`);
  }
}
