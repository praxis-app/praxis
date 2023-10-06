import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
