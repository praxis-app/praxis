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

  @Column({ default: 2 })
  @Field(() => Int)
  standAsidesLimit: number;

  @Column({ default: 2 })
  @Field(() => Int)
  reservationsLimit: number;

  @Column({ default: 50 })
  @Field(() => Int)
  ratificationThreshold: number;

  @Column({ default: GroupPrivacy.Private })
  @Field()
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
