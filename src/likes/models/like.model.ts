import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/models/comment.model';
import { Notification } from '../../notifications/models/notification.model';
import { Post } from '../../posts/models/post.model';
import { Question } from '../../vibe-check/models/question.model';
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

  @ManyToOne(() => Question, (question) => question.likes, {
    onDelete: 'CASCADE',
  })
  question?: Question;

  @Column({ nullable: true })
  questionId?: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Notification, (notification) => notification.like)
  notifications: Notification[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
