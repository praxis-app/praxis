import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProposalActionRole } from "../../../proposals/proposal-actions/models/proposal-action-role.model";
import { Role } from "../../models/role.model";

@Entity()
@ObjectType()
export class Permission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  enabled: boolean;

  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, (role) => role.permissions, {
    onDelete: "CASCADE",
    nullable: true,
  })
  role?: Role;

  @Column({ nullable: true })
  roleId?: number;

  @Field(() => ProposalActionRole, { nullable: true })
  @ManyToOne(() => Role, (role) => role.permissions, {
    onDelete: "CASCADE",
    nullable: true,
  })
  proposedRole?: ProposalActionRole;

  @Column({ nullable: true })
  proposedRoleId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
