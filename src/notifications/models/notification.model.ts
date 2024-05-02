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
import { Group } from '../../groups/models/group.model';
import { Like } from '../../likes/models/like.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { Question } from '../../vibe-check/models/question.model';
import { QuestionnaireTicket } from '../../vibe-check/models/questionnaire-ticket.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { NotificationStatus } from '../notifications.constants';

@ObjectType()
@Entity()
export class Notification {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  notificationType: string;

  @Column({ default: NotificationStatus.Unread })
  @Field()
  status: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => User, (otherUser) => otherUser.notifications, {
    onDelete: 'CASCADE',
  })
  otherUser: User | null;

  @Column({ nullable: true, type: 'int' })
  otherUserId: number | null;

  @ManyToOne(() => Group, (group) => group.notifications, {
    onDelete: 'CASCADE',
  })
  group: Group | null;

  @Column({ nullable: true, type: 'int' })
  groupId: number | null;

  @ManyToOne(() => Proposal, (proposal) => proposal.notifications, {
    onDelete: 'CASCADE',
  })
  proposal: Proposal | null;

  @Column({ nullable: true, type: 'int' })
  proposalId: number | null;

  @ManyToOne(() => Post, (post) => post.notifications, {
    onDelete: 'CASCADE',
  })
  post: Post | null;

  @Column({ nullable: true, type: 'int' })
  postId: number | null;

  @ManyToOne(() => Comment, (comment) => comment.notifications, {
    onDelete: 'CASCADE',
  })
  comment: Comment | null;

  @Column({ nullable: true, type: 'int' })
  commentId: number | null;

  @ManyToOne(() => Vote, (vote) => vote.notifications, {
    onDelete: 'CASCADE',
  })
  vote: Vote | null;

  @Column({ nullable: true, type: 'int' })
  voteId: number | null;

  @ManyToOne(() => Like, (like) => like.notifications, {
    onDelete: 'CASCADE',
  })
  like: Like | null;

  @Column({ nullable: true, type: 'int' })
  likeId: number | null;

  @ManyToOne(() => Question, (question) => question.notifications, {
    onDelete: 'CASCADE',
  })
  question: Question | null;

  @Column({ nullable: true, type: 'int' })
  questionId: number | null;

  @ManyToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.notifications,
    {
      onDelete: 'CASCADE',
    },
  )
  questionnaireTicket: QuestionnaireTicket | null;

  @Column({ nullable: true, type: 'int' })
  questionnaireTicketId: number | null;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
