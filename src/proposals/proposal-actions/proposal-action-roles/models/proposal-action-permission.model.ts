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

  @Column({ nullable: true })
  @Field()
  manageRoles?: boolean;

  @Column({ nullable: true })
  @Field()
  manageSettings?: boolean;

  @Column({ nullable: true })
  @Field()
  managePosts?: boolean;

  @Column({ nullable: true })
  @Field()
  manageComments?: boolean;

  @Column({ nullable: true })
  @Field()
  manageEvents?: boolean;

  @Column({ nullable: true })
  @Field()
  updateGroup?: boolean;

  @Column({ nullable: true })
  @Field()
  deleteGroup?: boolean;

  @Column({ nullable: true })
  @Field()
  createEvents?: boolean;

  @Column({ nullable: true })
  @Field()
  approveMemberRequests?: boolean;

  @Column({ nullable: true })
  @Field()
  removeMembers?: boolean;

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
