import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/models/user.model';

@Entity()
@ObjectType()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: false })
  @Field()
  revoked: boolean;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  userId: number;

  @Column()
  @Field()
  expiresAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
