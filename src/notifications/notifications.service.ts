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
    const message = this.getNotificationMessage(actionType);
    const notification = await this.repository.save({
      actionType,
      message,
      userId,
      otherUserId,
    });
    await this.pubSub.publish(`user-notification-${userId}`, notification);
  }

  getNotificationMessage(actionType: NotificationActionType) {
    if (actionType === NotificationActionType.ProposalVote) {
      return 'Someone voted on your proposal';
    }
    if (actionType === NotificationActionType.ProposalComment) {
      return 'Someone commented on your proposal';
    }
    if (actionType === NotificationActionType.PostComment) {
      return 'Someone commented on your post';
    }
    if (actionType === NotificationActionType.PostLike) {
      return 'Someone liked your post';
    }
  }
}
