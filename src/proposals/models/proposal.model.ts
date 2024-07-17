// Used for reference: https://github.com/forrestwilkins/anrcho/blob/master/app/models/proposal.rb

import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
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
import { Comment } from '../../comments/models/comment.model';
import { Group } from '../../groups/models/group.model';
import { Image } from '../../images/models/image.model';
import { Notification } from '../../notifications/models/notification.model';
import { Post } from '../../posts/models/post.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { ProposalAction } from '../proposal-actions/models/proposal-action.model';
import { ProposalStage } from '../proposals.constants';
import { ProposalConfig } from './proposal-config.model';

registerEnumType(ProposalStage, {
  name: 'ProposalStage',
});

@Entity()
@ObjectType()
export class Proposal {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  body: string | null;

  @Column({ type: 'varchar', default: ProposalStage.Voting })
  @Field(() => ProposalStage)
  stage: ProposalStage;

  @OneToOne(() => ProposalAction, (action) => action.proposal, {
    cascade: true,
  })
  @Field(() => ProposalAction)
  action: ProposalAction;

  @OneToOne(() => ProposalConfig, (proposalConfig) => proposalConfig.proposal, {
    cascade: true,
  })
  config: ProposalConfig;

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

  @OneToMany(() => Post, (post) => post.sharedProposal)
  shares: Post[];

  @OneToMany(() => Notification, (notification) => notification.proposal)
  notifications: Notification[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.proposals, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Group, (group) => group.proposals, { onDelete: 'CASCADE' })
  group: Group | null;

  @Column({ type: 'int', nullable: true })
  groupId: number | null;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
