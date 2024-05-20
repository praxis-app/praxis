import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/models/group.model';
import { Notification } from '../../notifications/models/notification.model';
import { ConversationMember } from './conversation-member.model';
import { Message } from './message.model';

@Entity()
@ObjectType()
export class Conversation {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  name: string;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(() => ConversationMember, (member) => member.conversation)
  members: ConversationMember[];

  @OneToMany(() => Notification, (notification) => notification.conversation)
  notifications: Notification[];

  @ManyToOne(() => Group, (group) => group.conversations, {
    onDelete: 'CASCADE',
  })
  group: Group | null;

  @Column({ type: 'int', nullable: true })
  groupId: number | null;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
