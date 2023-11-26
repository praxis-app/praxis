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
import { ProposalAction } from '../../models/proposal-action.model';

@Entity()
@ObjectType()
export class ProposalActionGroupConfig {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  privacy: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  oldPrivacy: string;

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