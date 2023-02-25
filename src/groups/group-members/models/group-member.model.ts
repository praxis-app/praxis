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
import { Group } from "../../models/group.model";

@Entity()
@ObjectType()
export class GroupMember {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ManyToOne(() => User, (user) => user.groupMembers, {
    onDelete: "CASCADE",
  })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: "CASCADE" })
  @Field(() => Group)
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
