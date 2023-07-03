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

export enum MemberRequestStatus {
  Approved = "approved",
  Denied = "denied",
  Pending = "pending",
}

@Entity()
@ObjectType()
export class MemberRequest {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: MemberRequestStatus.Pending })
  status: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Group, (group) => group.posts, { onDelete: "CASCADE" })
  @Field(() => Group)
  group: Group;

  @Column()
  groupId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
