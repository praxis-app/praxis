import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Group } from "../../groups/models/group.model";
import { Permission } from "../permissions/models/permission.model";
import { RoleMember } from "../role-members/models/role-member.model";

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

  @Field(() => [RoleMember])
  @OneToMany(() => RoleMember, (member) => member.role, {
    cascade: true,
  })
  members: RoleMember[];

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.posts, { onDelete: "CASCADE" })
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
