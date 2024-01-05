// TODO: Account for notifications sent to multiple users

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Repository } from 'typeorm';
import { Notification } from './models/notification.model';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,

    @InjectRepository(Notification)
    private repository: Repository<Notification>,
  ) {}

  async createNotification(
    notificationData: Partial<Notification>,
    userId: number,
  ) {
    const notification = await this.repository.save(notificationData);
    await this.pubSub.publish(`user-notification-${userId}`, notification);
  }
}
