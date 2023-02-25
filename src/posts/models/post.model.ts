// TODO: Determine whether GraphQL models should be separate from TypeORM entities

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
import { Image } from "../../images/models/image.model";
import { User } from "../../users/models/user.model";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  body?: string;

  @Field(() => [Image])
  @OneToMany(() => Image, (image) => image.post)
  images: Image[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.posts, { onDelete: "CASCADE" })
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
