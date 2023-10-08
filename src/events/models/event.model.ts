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
import { Image } from '../../images/models/image.model';
import { Post } from '../../posts/models/post.model';
import { EventAttendee } from '../event-attendees/models/event-attendee.model';

@ObjectType()
@Entity()
export class Event {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ default: false })
  @Field()
  online: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  externalLink?: string;

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, (attendee) => attendee.event)
  attendees: EventAttendee[];

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.event, {
    cascade: true,
  })
  posts: Post[];

  @Field(() => [Image])
  @OneToMany(() => Image, (image) => image.event)
  images: Image[];

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.events, { onDelete: 'CASCADE' })
  group?: Group;

  @Column({ nullable: true })
  groupId: number;

  @Column()
  @Field()
  startsAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  endsAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
