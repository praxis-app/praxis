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
import { Answer } from './answer.model';

@ObjectType()
@Entity()
export class QuestionnaireTicket {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
  })
  answers: Answer[];

  @ManyToOne(() => Group, (group) => group.rules, {
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
