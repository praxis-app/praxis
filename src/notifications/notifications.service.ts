// TODO: Account for notifications sent to multiple users

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Repository } from 'typeorm';
import { paginate } from '../common/common.utils';
import { Notification } from './models/notification.model';
import { UpdateNotificationInput } from './models/update-notification.input';

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
    const sortedNotifications = notifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return offset !== undefined
      ? paginate(sortedNotifications, offset, limit)
      : sortedNotifications;
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

  async updateNotification({ id, status }: UpdateNotificationInput) {
    await this.notificationRepository.update(id, { status });
    const notification = await this.notificationRepository.findOneOrFail({
      where: { id },
    });
    return { notification };
  }

  async deleteNotification(notificationId: number) {
    await this.notificationRepository.delete(notificationId);
    return true;
  }
}
