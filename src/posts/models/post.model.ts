// TODO: Determine whether GraphQL models should be separate from TypeORM entities

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
import { Comment } from '../../comments/models/comment.model';
import { Event } from '../../events/models/event.model';
import { Group } from '../../groups/models/group.model';
import { Image } from '../../images/models/image.model';
import { Like } from '../../likes/models/like.model';
import { User } from '../../users/models/user.model';

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  body?: string;

  @Field(() => [Image])
  @OneToMany(() => Image, (image) => image.post)
  images: Image[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field(() => [Like])
  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.posts, { onDelete: 'CASCADE' })
  group?: Group;

  @Column({ nullable: true })
  groupId: number;

  @Field(() => Event, { nullable: true })
  @ManyToOne(() => Event, (event) => event.posts, { onDelete: 'CASCADE' })
  event?: Event;

  @Column({ nullable: true })
  eventId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
