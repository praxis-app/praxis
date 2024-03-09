import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { FindOptionsWhere, Repository } from 'typeorm';
import { paginate } from '../common/common.utils';
import { Notification } from './models/notification.model';
import { NotificationStatus } from './notifications.constants';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,

    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotification(where?: FindOptionsWhere<Notification>) {
    return this.notificationRepository.findOne({ where });
  }

  async getNotifications(where?: FindOptionsWhere<Notification>) {
    return this.notificationRepository.find({ where });
  }

  async getNotificationsByUserId(
    userId: number,
    offset?: number,
    limit?: number,
  ) {
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

  async isOwnNotification(id: number, userId: number) {
    const count = await this.notificationRepository.count({
      where: { id, userId },
    });
    return count > 0;
  }

  async createNotification(data: Partial<Notification>) {
    const notification = await this.notificationRepository.save(data);
    await this.pubSub.publish(`user-notification-${data.userId}`, {
      notification,
    });
  }

  async updateNotification(id: number, data: Partial<Notification>) {
    await this.notificationRepository.update(id, data);
    const notification = await this.notificationRepository.findOneOrFail({
      where: { id },
    });
    return { notification };
  }

  async readNotifications(userId: number) {
    await this.notificationRepository.update(
      { userId },
      { status: NotificationStatus.Read },
    );
    return true;
  }

  async deleteNotification(notificationId: number) {
    await this.notificationRepository.delete(notificationId);
    return true;
  }

  async deleteNotifications(where: FindOptionsWhere<Notification>) {
    await this.notificationRepository.delete(where);
    return true;
  }
}
