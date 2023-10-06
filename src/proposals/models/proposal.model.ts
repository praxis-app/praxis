// Used for reference: https://github.com/forrestwilkins/anrcho/blob/master/app/models/proposal.rb

import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/models/group.model';
import { Image } from '../../images/models/image.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { ProposalStage } from '../proposals.constants';
import { ProposalAction } from '../proposal-actions/models/proposal-action.model';
import { Comment } from '../../comments/models/comment.model';

@Entity()
@ObjectType()
export class Proposal {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  body?: string;

  @OneToOne(() => ProposalAction, (action) => action.proposal, {
    cascade: true,
  })
  @Field(() => ProposalAction)
  action: ProposalAction;

  @Column({ default: ProposalStage.Voting })
  @Field()
  stage: string;

  @Field(() => [Vote])
  @OneToMany(() => Vote, (vote) => vote.proposal, {
    cascade: true,
  })
  votes: Vote[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.proposal, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => Image, (image) => image.proposal, {
    cascade: true,
  })
  @Field(() => [Image])
  images: Image[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.proposals, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.proposals, { onDelete: 'CASCADE' })
  // TODO: Set group as optional, in preparation for server proposals
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
