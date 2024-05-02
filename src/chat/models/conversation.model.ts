import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Notification } from '../../notifications/models/notification.model';
import { User } from '../../users/models/user.model';
import { Message } from './message.model';

@Entity()
@ObjectType()
export class Conversation {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true, type: 'varchar' })
  @Field(() => String, { nullable: true })
  name: string | null;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable()
  members: User[];

  @OneToMany(() => Notification, (notification) => notification.conversation)
  notifications: Notification[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
