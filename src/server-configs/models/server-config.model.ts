import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DecisionMakingModel } from '../../proposals/proposals.constants';
import { VotingTimeLimit } from '../../votes/votes.constants';

registerEnumType(DecisionMakingModel, {
  name: 'DecisionMakingModel',
});

@Entity()
@ObjectType()
export class ServerConfig {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  about: string | null;

  @Column({ type: 'int', default: DecisionMakingModel.CONSENSUS })
  @Field(() => DecisionMakingModel)
  decisionMakingModel: DecisionMakingModel;

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

  @Column({ nullable: true })
  @Field({ nullable: true })
  securityTxt?: string;

  @Column({ default: false })
  @Field()
  showCanaryStatement: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  serverQuestionsPrompt?: string;

  @Column({ nullable: true, type: 'int' })
  vibeChatId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
