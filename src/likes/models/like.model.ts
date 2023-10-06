import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/models/comment.model';
import { Post } from '../../posts/models/post.model';
import { User } from '../../users/models/user.model';

@Entity()
@ObjectType()
export class Like {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Post, { nullable: true })
  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
  })
  post?: Post;

  @Column({ nullable: true })
  postId?: number;

  @Field(() => Comment, { nullable: true })
  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @Column({ nullable: true })
  commentId?: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
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
