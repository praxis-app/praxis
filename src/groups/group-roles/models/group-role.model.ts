import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProposalActionRole } from "../../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role.model";
import { ServerPermission } from "../../../roles/permissions/models/server-permission.model";
import { User } from "../../../users/models/user.model";
import { Group } from "../../models/group.model";

@Entity()
@ObjectType()
export class GroupRole {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  color: string;

  @OneToOne(() => ServerPermission, (permission) => permission.role, {
    cascade: true,
  })
  serverPermission: ServerPermission;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  members: User[];

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.posts, { onDelete: "CASCADE" })
  group?: Group;

  @Column({ nullable: true })
  groupId?: number;

  @Field(() => [ProposalActionRole])
  @OneToMany(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.role
  )
  proposalActionRoles: ProposalActionRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
