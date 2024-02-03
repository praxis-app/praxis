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
import { DecisionMakingModel } from '../../proposals/proposals.constants';
import { VotingTimeLimit } from '../../votes/votes.constants';
import { QuestionnaireTicket } from './questionnaire-ticket.model';

@ObjectType()
@Entity()
export class QuestionnaireTicketConfig {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: DecisionMakingModel.Consensus })
  @Field()
  decisionMakingModel: string;

  @Column({ default: 2 })
  @Field(() => Int)
  standAsidesLimit: number;

  @Column({ default: 2 })
  @Field(() => Int)
  reservationsLimit: number;

  @Column({ default: 50 })
  @Field(() => Int)
  ratificationThreshold: number;

  @Column({ default: VotingTimeLimit.Unlimited })
  @Field(() => Int)
  votingTimeLimit: number;

  @OneToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.config,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  questionnaireTicket: QuestionnaireTicket;

  @Column()
  questionnaireTicketId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
