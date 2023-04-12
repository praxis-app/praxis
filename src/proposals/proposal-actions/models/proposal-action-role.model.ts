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
import { Permission } from "../../../roles/permissions/models/permission.model";
import { User } from "../../../users/models/user.model";
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

  @Field(() => [Permission], { nullable: true })
  @OneToMany(() => Permission, (permission) => permission.proposedRole, {
    cascade: true,
    nullable: true,
  })
  permissions?: Permission[];

  @Field(() => ProposalAction)
  @ManyToOne(() => ProposalAction, (proposalAction) => proposalAction.role, {
    onDelete: "CASCADE",
  })
  proposalAction: ProposalAction;

  @Column({ nullable: true })
  roleId?: number;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, (user) => user.roles, { nullable: true })
  @JoinTable()
  members?: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
