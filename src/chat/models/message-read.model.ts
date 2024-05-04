import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { Message } from './message.model';

@Entity()
@ObjectType()
export class MessageRead {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ManyToOne(() => User, (user) => user.messageReads, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Message, (message) => message.reads, {
    onDelete: 'CASCADE',
  })
  message: Message;

  @Column()
  messageId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
