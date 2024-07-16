import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProposalAction } from './proposal-action.model';
import { DecisionMakingModel } from '../../proposals.constants';

@Entity()
@ObjectType()
export class ProposalActionGroupConfig {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // -------------------------------------------------------------------------
  // Proposed changes
  // -------------------------------------------------------------------------

  @Column({ nullable: true })
  @Field({ nullable: true })
  privacy?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  adminModel?: string;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => DecisionMakingModel, { nullable: true })
  decisionMakingModel?: DecisionMakingModel;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  standAsidesLimit?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  reservationsLimit?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  ratificationThreshold?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  votingTimeLimit?: number;

  // -------------------------------------------------------------------------
  // Old values
  // -------------------------------------------------------------------------

  @Column({ nullable: true })
  @Field({ nullable: true })
  oldPrivacy?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  oldAdminModel?: string;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => DecisionMakingModel, { nullable: true })
  oldDecisionMakingModel?: DecisionMakingModel;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  oldStandAsidesLimit?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  oldReservationsLimit?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  oldRatificationThreshold?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  oldVotingTimeLimit?: number;

  // -------------------------------------------------------------------------
  // Relations and timestamps
  // -------------------------------------------------------------------------

  @Field(() => ProposalAction)
  @OneToOne(
    () => ProposalAction,
    (proposalAction) => proposalAction.groupConfig,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  proposalAction: ProposalAction;

  @Column()
  proposalActionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
