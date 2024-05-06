import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Notification } from '../../notifications/models/notification.model';
import { ConversationMember } from './conversation-member.model';
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

  @OneToMany(() => ConversationMember, (member) => member.conversation)
  members: ConversationMember[];

  @OneToMany(() => Notification, (notification) => notification.conversation)
  notifications: Notification[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
