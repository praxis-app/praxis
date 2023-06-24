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
import { GroupRole } from "./group-role.model";

export type GroupPermissions = Pick<
  GroupRolePermission,
  | "approveMemberRequests"
  | "createEvents"
  | "deleteGroup"
  | "manageComments"
  | "manageEvents"
  | "managePosts"
  | "manageRoles"
  | "manageSettings"
  | "removeMembers"
  | "updateGroup"
>;

export type GroupPermissionsMap = Record<number, GroupPermissions>;

@Entity()
@ObjectType()
export class GroupRolePermission {
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

  @Field(() => GroupRole)
  @OneToOne(() => GroupRole, (groupRole) => groupRole.permission, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  groupRole: GroupRole;

  @Column()
  groupRoleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
