import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../../users/models/user.model";
import { ProposalActionRole } from "./proposal-action-role.model";

@ObjectType()
@Entity()
export class ProposalActionRoleMember {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  changeType: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.proposalActionRoleMembers, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column()
  userId: number;

  @Field(() => ProposalActionRole)
  @ManyToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.members,
    {
      onDelete: "CASCADE",
    }
  )
  role: ProposalActionRole;

  @Column()
  proposalActionRoleId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
