import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/models/comment.model';
import { Notification } from '../../notifications/models/notification.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { Question } from './question.model';
import { QuestionnaireTicketConfig } from './questionnaire-ticket-config.model';

export enum QuestionnaireTicketStatus {
  InProgress = 'in-progress',
  Submitted = 'submitted',
  Approved = 'approved',
  Denied = 'denied',
}

@Entity()
@ObjectType()
export class QuestionnaireTicket {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: QuestionnaireTicketStatus.InProgress })
  @Field()
  status: string;

  @Column()
  initialMemberCount: number;

  @Field(() => [Question])
  @OneToMany(() => Question, (question) => question.questionnaireTicket, {
    cascade: true,
  })
  questions: Question[];

  @OneToMany(() => Vote, (vote) => vote.questionnaireTicket, {
    cascade: true,
  })
  votes: Vote[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.questionnaireTicket, {
    cascade: true,
  })
  comments: Comment[];

  @ManyToOne(() => User, (user) => user.questionnaireTickets, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;

  @OneToOne(
    () => QuestionnaireTicketConfig,
    (questionnaireTicketConfig) =>
      questionnaireTicketConfig.questionnaireTicket,
    {
      cascade: true,
    },
  )
  config: QuestionnaireTicketConfig;

  @OneToMany(
    () => Notification,
    (notification) => notification.questionnaireTicket,
  )
  notifications: Notification[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
