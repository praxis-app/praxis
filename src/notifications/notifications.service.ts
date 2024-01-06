// TODO: Account for notifications sent to multiple users

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Repository } from 'typeorm';
import { paginate } from '../common/common.utils';
import { Notification } from './models/notification.model';
import { NotificationActionType } from './notifications.constants';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,

    @InjectRepository(Notification)
    private repository: Repository<Notification>,
  ) {}

  async getNotifications(userId: number, offset?: number, limit?: number) {
    const notifications = await this.repository.find({
      where: { userId },
    });
    return offset !== undefined
      ? paginate(notifications, offset, limit)
      : notifications;
  }

  async getNotificationsCount(userId: number) {
    return this.repository.count({ where: { userId } });
  }

  async notify(
    actionType: NotificationActionType,
    userId: number,
    otherUserId?: number,
  ) {
    const notification = await this.repository.save({
      actionType,
      userId,
      otherUserId,
    });
    await this.pubSub.publish(`user-notification-${userId}`, notification);
  }

  async getNotificationMessage(notificationId: number) {
    const { actionType } = await this.repository.findOneOrFail({
      where: { id: notificationId },
    });

    if (actionType === NotificationActionType.ProposalVote) {
      return '{{userName}} voted on your proposal';
    }
    if (actionType === NotificationActionType.ProposalComment) {
      return '{{userName}} commented on your proposal';
    }
    if (actionType === NotificationActionType.PostComment) {
      return '{{userName}} commented on your post';
    }
    if (actionType === NotificationActionType.PostLike) {
      return '{{userName}} liked your post';
    }
  }
}
