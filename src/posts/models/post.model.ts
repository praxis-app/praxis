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
import { Notification } from '../../notifications/models/notification.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { User } from '../../users/models/user.model';

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  body: string | null;

  @OneToMany(() => Image, (image) => image.post)
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.post)
  notifications: Notification[];

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Group, (group) => group.posts, { onDelete: 'CASCADE' })
  group: Group | null;

  @Column({ type: 'int', nullable: true })
  groupId: number | null;

  @ManyToOne(() => Event, (event) => event.posts, { onDelete: 'CASCADE' })
  event: Event | null;

  @Column({ type: 'int', nullable: true })
  eventId: number | null;

  @OneToMany(() => Post, (post) => post.sharedPost)
  shares: Post[];

  @ManyToOne(() => Post, (post) => post.shares, {
    createForeignKeyConstraints: false,
  })
  sharedPost: Post | null;

  @Column({ type: 'int', nullable: true })
  sharedPostId: number | null;

  @ManyToOne(() => Proposal, (proposal) => proposal.shares, {
    createForeignKeyConstraints: false,
  })
  sharedProposal: Proposal | null;

  @Column({ type: 'int', nullable: true })
  sharedProposalId: number | null;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
