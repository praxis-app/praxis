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
import { Image } from '../../images/models/image.model';
import { Like } from '../../likes/models/like.model';
import { Notification } from '../../notifications/models/notification.model';
import { User } from '../../users/models/user.model';

@Entity()
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true, type: 'varchar' })
  @Field(() => String, { nullable: true })
  body: string;

  @OneToMany(() => Image, (image) => image.comment)
  images: Image[];

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.comment)
  notifications: Notification[];

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
