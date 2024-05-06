import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../chat/models/message.model';
import { Comment } from '../../comments/models/comment.model';
import { Event } from '../../events/models/event.model';
import { Group } from '../../groups/models/group.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { ProposalActionEvent } from '../../proposals/proposal-actions/models/proposal-action-event.model';
import { ProposalAction } from '../../proposals/proposal-actions/models/proposal-action.model';
import { User } from '../../users/models/user.model';

@ObjectType()
@Entity()
export class Image {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  filename: string;

  @Column({ nullable: true })
  @Field()
  imageType: string;

  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: 'CASCADE',
  })
  post?: Post;

  @Column({ nullable: true })
  postId?: number;

  @ManyToOne(() => Comment, (comment) => comment.images, {
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @Column({ nullable: true })
  commentId?: number;

  @ManyToOne(() => Message, (message) => message.images, {
    onDelete: 'CASCADE',
  })
  message?: Comment;

  @Column({ nullable: true })
  messageId?: number;

  @ManyToOne(() => User, (user) => user.images, {
    onDelete: 'CASCADE',
  })
  user?: User;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => Group, (group) => group.images, {
    onDelete: 'CASCADE',
  })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @ManyToOne(() => Event, (event) => event.images, {
    onDelete: 'CASCADE',
  })
  event?: Event;

  @Column({ nullable: true })
  eventId?: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.images, {
    onDelete: 'CASCADE',
  })
  proposal?: Proposal;

  @Column({ nullable: true })
  proposalId?: number;

  @ManyToOne(() => ProposalAction, (proposalAction) => proposalAction.images, {
    onDelete: 'CASCADE',
  })
  proposalAction?: ProposalAction;

  @Column({ nullable: true })
  proposalActionId?: number;

  @ManyToOne(
    () => ProposalActionEvent,
    (proposalActionEvent) => proposalActionEvent.images,
    {
      onDelete: 'CASCADE',
    },
  )
  proposalActionEvent?: ProposalActionEvent;

  @Column({ nullable: true })
  proposalActionEventId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
