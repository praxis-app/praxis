// TODO: Test and verify that relations are correct - below is a WIP

import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../models/user.model";

@ObjectType()
@Entity()
export class Follow {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.followers, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.following, {
    onDelete: "CASCADE",
  })
  followedUser: User;

  @Column()
  followedUserId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
