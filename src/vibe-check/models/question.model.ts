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
import { Like } from '../../likes/models/like.model';
import { Notification } from '../../notifications/models/notification.model';
import { Answer } from './answer.model';
import { QuestionnaireTicket } from './questionnaire-ticket.model';

@ObjectType()
@Entity()
export class Question {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  text: string;

  @Column()
  @Field(() => Int)
  priority: number;

  @OneToOne(() => Answer, (answer) => answer.question, {
    cascade: true,
  })
  answer: Answer;

  @OneToMany(() => Comment, (comment) => comment.question)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.question)
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.question)
  notifications: Notification[];

  @ManyToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.questions,
    { onDelete: 'CASCADE' },
  )
  questionnaireTicket: QuestionnaireTicket;

  @Column({ nullable: true })
  questionnaireTicketId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
