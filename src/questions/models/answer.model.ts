import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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
