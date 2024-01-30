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
import { Like } from '../../likes/models/like.model';
import { Notification } from '../../notifications/models/notification.model';
import { Question } from './question.model';
import { QuestionnaireTicket } from './questionnaire-ticket.model';

@ObjectType()
@Entity()
export class Answer {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  text: string;

  @OneToMany(() => Comment, (comment) => comment.answer)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.answer)
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.answer)
  notifications: Notification[];

  @ManyToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.answers,
    { onDelete: 'CASCADE' },
  )
  questionnaireTicket: QuestionnaireTicket;

  @Column()
  questionnaireTicketId: number;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @Column()
  questionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
