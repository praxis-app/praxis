// TODO: Account for notifications sent to multiple users

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Repository } from 'typeorm';
import { paginate } from '../common/common.utils';
import { Notification } from './models/notification.model';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,

    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(userId: number, offset?: number, limit?: number) {
    const notifications = await this.notificationRepository.find({
      where: { userId },
    });
    return offset !== undefined
      ? paginate(notifications, offset, limit)
      : notifications;
  }

  async getNotificationsCount(userId: number) {
    return this.notificationRepository.count({ where: { userId } });
  }

  async getOtherUser(notificationId: number) {
    const { otherUser } = await this.notificationRepository.findOneOrFail({
      where: { id: notificationId },
      relations: ['otherUser'],
    });
    return otherUser;
  }

  async getProposal(notificationId: number) {
    const { proposal } = await this.notificationRepository.findOneOrFail({
      where: { id: notificationId },
      relations: ['proposal'],
    });
    return proposal;
  }

  async getPost(notificationId: number) {
    const { post } = await this.notificationRepository.findOneOrFail({
      where: { id: notificationId },
      relations: ['post'],
    });
    return post;
  }

  async createNotification(notificationData: Partial<Notification>) {
    const notification =
      await this.notificationRepository.save(notificationData);

    await this.pubSub.publish(
      `user-notification-${notificationData.userId}`,
      notification,
    );
  }

  async deleteNotification(notificationId: number) {
    await this.notificationRepository.delete(notificationId);
    return true;
  }
}
