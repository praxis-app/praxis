// TODO: Account for notifications sent to multiple users

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { paginate } from '../common/common.utils';
import { BulkUpdateNotificationsInput } from './models/bulk-update-notifications.input';
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

  async getNotificationsCount(where?: FindOptionsWhere<Notification>) {
    return this.notificationRepository.count({ where });
  }

  async isOwnNotification(notificationId: number, userId: number) {
    const count = await this.notificationRepository.count({
      where: { id: notificationId, userId },
    });
    return count > 0;
  }

  async createNotification(notificationData: Partial<Notification>) {
    const notification =
      await this.notificationRepository.save(notificationData);

    await this.pubSub.publish(`user-notification-${notificationData.userId}`, {
      notification,
    });
  }

  async updateNotification({ id, status }: UpdateNotificationInput) {
    await this.notificationRepository.update(id, { status });
    const notification = await this.notificationRepository.findOneOrFail({
      where: { id },
    });
    return { notification };
  }

  async bulkUpdateNotifications({ ids, status }: BulkUpdateNotificationsInput) {
    await this.notificationRepository.update(
      {
        id: In(ids),
      },
      { status },
    );
    const notifications = await this.notificationRepository.find({
      where: { id: In(ids) },
    });
    return { notifications };
  }

  async deleteNotification(notificationId: number) {
    await this.notificationRepository.delete(notificationId);
    return true;
  }

  async clearNotifications(userId: number) {
    await this.notificationRepository.delete({ userId });
    return true;
  }
}
