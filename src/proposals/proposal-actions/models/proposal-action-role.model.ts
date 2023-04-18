import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../../../roles/models/role.model";
import { ProposalActionPermission } from "./proposal-action-permission.model";
import { ProposalActionRoleMember } from "./proposal-action-role-member.model";
import { ProposalAction } from "./proposal-action.model";

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

  @Field(() => [ProposalActionPermission], { nullable: true })
  @OneToMany(() => ProposalActionPermission, (permission) => permission.role, {
    cascade: true,
    nullable: true,
  })
  permissions?: ProposalActionPermission[];

  @Field(() => [ProposalActionRoleMember], { nullable: true })
  @OneToMany(() => ProposalActionRoleMember, (roleMember) => roleMember.role, {
    cascade: true,
    nullable: true,
  })
  members?: ProposalActionRoleMember[];

  @Field(() => ProposalAction)
  @ManyToOne(() => ProposalAction, (proposalAction) => proposalAction.role, {
    onDelete: "CASCADE",
  })
  proposalAction: ProposalAction;

  @Column()
  proposalActionId: number;

  @Field(() => Role)
  @ManyToOne(() => Role, (role) => role.proposalActionRoles)
  role: Role;

  @Column()
  roleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
