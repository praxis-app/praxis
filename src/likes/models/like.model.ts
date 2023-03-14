import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "../../posts/models/post.model";
import { User } from "../../users/models/user.model";

@Entity()
@ObjectType()
export class Like {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: "CASCADE",
  })
  post: Post;

  @Column()
  postId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
