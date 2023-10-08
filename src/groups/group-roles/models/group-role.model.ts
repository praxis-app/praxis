import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProposalActionRole } from '../../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role.model';
import { User } from '../../../users/models/user.model';
import { Group } from '../../models/group.model';
import { GroupRolePermission } from './group-role-permission.model';

@Entity()
@ObjectType()
export class GroupRole {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  color: string;

  @OneToOne(() => GroupRolePermission, (permission) => permission.groupRole, {
    cascade: true,
  })
  permission: GroupRolePermission;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.groupRoles)
  @JoinTable()
  members: User[];

  @Field(() => Group)
  @ManyToOne(() => Group, (group) => group.posts, { onDelete: 'CASCADE' })
  group: Group;

  @Column()
  groupId: number;

  @Field(() => [ProposalActionRole])
  @OneToMany(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.groupRole,
  )
  proposalActionRoles: ProposalActionRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
