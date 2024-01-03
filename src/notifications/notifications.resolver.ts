import { Resolver } from '@nestjs/graphql';
import { Notification } from './models/notification.model';

@Resolver(() => Notification)
export class NotificationsResolver {}
