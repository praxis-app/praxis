import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupRole } from '../../../groups/group-roles/models/group-role.model';
import { ServerRole } from '../../../server-roles/models/server-role.model';
import { ProposalActionPermission } from './proposal-action-permission.model';
import { ProposalActionRoleMember } from './proposal-action-role-member.model';
import { ProposalAction } from './proposal-action.model';

@Entity()
@ObjectType()
export class ProposalActionRole {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  oldName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  oldColor?: string;

  @OneToOne(
    () => ProposalActionPermission,
    (permission) => permission.proposalActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  permission?: ProposalActionPermission;

  @Field(() => [ProposalActionRoleMember], { nullable: true })
  @OneToMany(
    () => ProposalActionRoleMember,
    (roleMember) => roleMember.proposalActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  members?: ProposalActionRoleMember[];

  @Field(() => ProposalAction)
  @OneToOne(() => ProposalAction, (proposalAction) => proposalAction.role, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposalAction: ProposalAction;

  @Column()
  proposalActionId: number;

  @Field(() => ServerRole, { nullable: true })
  @ManyToOne(() => ServerRole, (serverRole) => serverRole.proposalActionRoles, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  serverRole?: ServerRole;

  @Column({ nullable: true })
  serverRoleId?: number;

  @Field(() => GroupRole, { nullable: true })
  @ManyToOne(() => GroupRole, (groupRole) => groupRole.proposalActionRoles, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  groupRole?: GroupRole;

  @Column({ nullable: true })
  groupRoleId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
