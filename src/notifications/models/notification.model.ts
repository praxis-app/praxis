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
import { Question } from '../../questions/models/question.model';
import { QuestionnaireTicket } from '../../questions/models/questionnaire-ticket.model';
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
  otherUser?: User;

  @Column({ nullable: true })
  otherUserId?: number;

  @ManyToOne(() => Group, (group) => group.notifications, {
    onDelete: 'CASCADE',
  })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.notifications, {
    onDelete: 'CASCADE',
  })
  proposal?: Proposal;

  @Column({ nullable: true })
  proposalId?: number;

  @ManyToOne(() => Post, (post) => post.notifications, {
    onDelete: 'CASCADE',
  })
  post?: Post;

  @Column({ nullable: true })
  postId?: number;

  @ManyToOne(() => Comment, (comment) => comment.notifications, {
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @Column({ nullable: true })
  commentId?: number;

  @ManyToOne(() => Vote, (vote) => vote.notifications, {
    onDelete: 'CASCADE',
  })
  vote?: Vote;

  @Column({ nullable: true })
  voteId?: number;

  @ManyToOne(() => Like, (like) => like.notifications, {
    onDelete: 'CASCADE',
  })
  like?: Like;

  @Column({ nullable: true })
  likeId?: number;

  @ManyToOne(() => Question, (question) => question.notifications, {
    onDelete: 'CASCADE',
  })
  question?: Question;

  @Column({ nullable: true })
  questionId?: number;

  @ManyToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.notifications,
    {
      onDelete: 'CASCADE',
    },
  )
  questionnaireTicket?: QuestionnaireTicket;

  @Column({ nullable: true })
  questionnaireTicketId?: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
