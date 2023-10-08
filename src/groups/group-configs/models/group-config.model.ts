import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../models/group.model';

export enum GroupPrivacy {
  Private = 'private',
  Public = 'public',
}

@Entity()
@ObjectType()
export class GroupConfig {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: GroupPrivacy.Private })
  privacy: string;

  @Field(() => Group)
  @OneToOne(() => Group, (group) => group.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  group: Group;

  @Column()
  groupId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
