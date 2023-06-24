import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProposalActionRole } from "./proposal-action-role.model";

@Entity()
@ObjectType()
export class ProposalActionPermission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  @Field()
  manageRoles: boolean;

  @Column({ default: false })
  @Field()
  manageSettings: boolean;

  @Column({ default: false })
  @Field()
  managePosts: boolean;

  @Column({ default: false })
  @Field()
  manageComments: boolean;

  @Column({ default: false })
  @Field()
  manageEvents: boolean;

  @Column({ default: false })
  @Field()
  updateGroup: boolean;

  @Column({ default: false })
  @Field()
  deleteGroup: boolean;

  @Column({ default: false })
  @Field()
  createEvents: boolean;

  @Column({ default: false })
  @Field()
  approveMemberRequests: boolean;

  @Column({ default: false })
  @Field()
  removeMembers: boolean;

  @Field(() => ProposalActionRole, { name: "role" })
  @OneToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.permission,
    {
      onDelete: "CASCADE",
    }
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
