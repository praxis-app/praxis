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
import { ProposalActionRole } from './proposal-action-role.model';

@Entity()
@ObjectType()
export class ProposalActionPermission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  manageRoles?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  manageSettings?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  managePosts?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  manageComments?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  manageEvents?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  updateGroup?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  deleteGroup?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  createEvents?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  approveMemberRequests?: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  removeMembers?: boolean;

  @Field(() => ProposalActionRole, { name: 'role' })
  @OneToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.permission,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
