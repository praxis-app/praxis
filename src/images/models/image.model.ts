import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/models/comment.model';
import { Event } from '../../events/models/event.model';
import { Group } from '../../groups/models/group.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { ProposalAction } from '../../proposals/proposal-actions/models/proposal-action.model';
import { ProposalActionEvent } from '../../proposals/proposal-actions/proposal-action-events/models/proposal-action-event.model';
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

  @Field(() => Post, { nullable: true })
  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: 'CASCADE',
  })
  post?: Post;

  @Column({ nullable: true })
  postId?: number;

  @Field(() => Comment, { nullable: true })
  @ManyToOne(() => Comment, (comment) => comment.images, {
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @Column({ nullable: true })
  commentId?: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.images, {
    onDelete: 'CASCADE',
  })
  user?: User;

  @Column({ nullable: true })
  userId?: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.images, {
    onDelete: 'CASCADE',
  })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @Field(() => Event, { nullable: true })
  @ManyToOne(() => Event, (event) => event.images, {
    onDelete: 'CASCADE',
  })
  event?: Event;

  @Column({ nullable: true })
  eventId?: number;

  @Field(() => Proposal, { nullable: true })
  @ManyToOne(() => Proposal, (proposal) => proposal.images, {
    onDelete: 'CASCADE',
  })
  proposal?: Proposal;

  @Column({ nullable: true })
  proposalId?: number;

  @Field(() => ProposalAction, { nullable: true })
  @ManyToOne(() => ProposalAction, (proposalAction) => proposalAction.images, {
    onDelete: 'CASCADE',
  })
  proposalAction?: ProposalAction;

  @Column({ nullable: true })
  proposalActionId?: number;

  @Field(() => ProposalActionEvent, { nullable: true })
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
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
