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
import { QuestionnaireTicketQuestion } from './questionnaire-ticket-question.model';

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
    () => QuestionnaireTicketQuestion,
    (questionnaireTicketQuestion) => questionnaireTicketQuestion.answers,
    { onDelete: 'CASCADE' },
  )
  questionnaireTicketQuestion: QuestionnaireTicketQuestion;

  @Column()
  questionnaireTicketQuestionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
