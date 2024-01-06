import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { NotificationStatus } from '../notifications.constants';

@ObjectType()
@Entity()
export class Notification {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  actionType: string;

  @Column({ default: NotificationStatus.Unread })
  @Field()
  status: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => User, (otherUser) => otherUser.notifications, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  otherUser?: User;

  @Column({ nullable: true })
  otherUserId?: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
