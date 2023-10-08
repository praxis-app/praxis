import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../users/models/user.model';
import { ProposalActionRole } from './proposal-action-role.model';

@ObjectType()
@Entity()
export class ProposalActionRoleMember {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  changeType: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.proposalActionRoleMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;

  @Field(() => ProposalActionRole, { name: 'role' })
  @ManyToOne(() => ProposalActionRole, (role) => role.members, {
    onDelete: 'CASCADE',
  })
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
