import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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
