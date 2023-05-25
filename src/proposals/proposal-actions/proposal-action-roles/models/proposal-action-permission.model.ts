import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  enabled: boolean;

  @Field(() => ProposalActionRole, { name: "role" })
  @ManyToOne(() => ProposalActionRole, (role) => role.permissions, {
    onDelete: "CASCADE",
  })
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
