import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/models/group.model';

@ObjectType()
@Entity()
export class Rule {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  text: string;

  @Column()
  @Field(() => Int)
  priority: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.rules, { onDelete: 'CASCADE' })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
