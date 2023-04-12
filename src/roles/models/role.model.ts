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
import { Group } from "../../groups/models/group.model";
import { ProposalActionRole } from "../../proposals/proposal-actions/models/proposal-action-role.model";
import { User } from "../../users/models/user.model";
import { Permission } from "../permissions/models/permission.model";

@Entity()
@ObjectType()
export class Role {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  color: string;

  @Field(() => [Permission])
  @OneToMany(() => Permission, (permission) => permission.role, {
    cascade: true,
  })
  permissions: Permission[];

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
