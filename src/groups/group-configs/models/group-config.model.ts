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
import { GroupConfigDefaults } from '../../groups.constants';
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

  @Column({ default: GroupConfigDefaults.StandAsidesLimit })
  @Field(() => Int)
  standAsidesLimit: number;

  @Column({ default: GroupConfigDefaults.ReservationsLimit })
  @Field(() => Int)
  reservationsLimit: number;

  @Column({ default: GroupConfigDefaults.RatificationThreshold })
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
