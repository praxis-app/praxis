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
import { Vote } from '../../votes/models/vote.model';
import { Answer } from './answer.model';

@ObjectType()
@Entity()
export class QuestionnaireTicket {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Answer, (answer) => answer.questionnaireTicket)
  answers: Answer[];

  @OneToMany(() => Vote, (vote) => vote.questionnaireTicket)
  votes: Vote[];

  @ManyToOne(() => Group, (group) => group.questionnaireTickets, {
    onDelete: 'CASCADE',
  })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
