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
import { Group } from '../../groups/models/group.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { Answer } from './answer.model';
import { QuestionnaireTicketConfig } from './questionnaire-ticket-config.model';

export enum QuestionnaireTicketStatus {
  InProgress = 'in-progress',
  Submitted = 'submitted',
  Approved = 'approved',
  Denied = 'denied',
}

@ObjectType()
@Entity()
export class QuestionnaireTicket {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: QuestionnaireTicketStatus.InProgress })
  @Field()
  status: string;

  @OneToMany(() => Answer, (answer) => answer.questionnaireTicket, {
    cascade: true,
  })
  answers: Answer[];

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

  @ManyToOne(() => Group, (group) => group.questionnaireTickets, {
    onDelete: 'CASCADE',
  })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @OneToOne(
    () => QuestionnaireTicketConfig,
    (questionnaireTicketConfig) =>
      questionnaireTicketConfig.questionnaireTicket,
    {
      cascade: true,
    },
  )
  config: QuestionnaireTicketConfig;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
