import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/models/user.model';
import { Event } from '../../models/event.model';

export enum EventAttendeeStatus {
  CoHost = 'co-host',
  Going = 'going',
  Host = 'host',
  Interested = 'interested',
}

@ObjectType()
@Entity()
export class EventAttendee {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  status: string;

  @ManyToOne(() => User, (user) => user.eventAttendees, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Event, (event) => event.attendees, { onDelete: 'CASCADE' })
  @Field(() => Event)
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
