import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../../../roles/models/role.model";
import { User } from "../../../users/models/user.model";
import { ProposalActionPermission } from "./proposal-action-permission.model";
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

  @Field(() => ProposalAction)
  @ManyToOne(() => ProposalAction, (proposalAction) => proposalAction.role, {
    onDelete: "CASCADE",
  })
  proposalAction: ProposalAction;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, (user) => user.roles, { nullable: true })
  @JoinTable()
  members?: User[];

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
