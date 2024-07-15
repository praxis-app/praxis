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
import { Proposal } from './proposal.model';
import { DecisionMakingModel } from '../proposals.constants';

@Entity()
@ObjectType()
export class ProposalConfig {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'int', default: DecisionMakingModel.CONSENSUS })
  @Field(() => DecisionMakingModel)
  decisionMakingModel: DecisionMakingModel;

  @Column()
  @Field(() => Int)
  standAsidesLimit: number;

  @Column()
  @Field(() => Int)
  reservationsLimit: number;

  @Column()
  @Field(() => Int)
  ratificationThreshold: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  closingAt?: Date;

  @Field(() => Proposal)
  @OneToOne(() => Proposal, (proposal) => proposal.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposal: Proposal;

  @Column()
  proposalId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
