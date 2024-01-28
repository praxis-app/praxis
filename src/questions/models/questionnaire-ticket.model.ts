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
import { Group } from '../../groups/models/group.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { Answer } from './answer.model';

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

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
