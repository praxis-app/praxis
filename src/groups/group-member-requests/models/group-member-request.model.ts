import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/models/user.model';
import { Group } from '../../models/group.model';

export enum GroupMemberRequestStatus {
  Approved = 'approved',
  Denied = 'denied',
  Pending = 'pending',
}

@Entity()
@ObjectType()
export class GroupMemberRequest {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: GroupMemberRequestStatus.Pending })
  status: string;

  @ManyToOne(() => User, (user) => user.groupMemberRequests, {
    onDelete: 'CASCADE',
  })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Group, (group) => group.memberRequests, {
    onDelete: 'CASCADE',
  })
  @Field(() => Group)
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
