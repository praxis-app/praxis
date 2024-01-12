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
import { Notification } from '../../notifications/models/notification.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { User } from '../../users/models/user.model';

@Entity()
@ObjectType()
export class Vote {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  voteType: string;

  @Field(() => Proposal)
  @ManyToOne(() => Proposal, (proposal) => proposal.votes, {
    onDelete: 'CASCADE',
  })
  proposal: Proposal;

  @Column()
  proposalId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Notification, (notification) => notification.vote)
  notifications: Notification[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
