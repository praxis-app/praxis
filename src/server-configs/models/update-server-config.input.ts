import { Field, InputType, Int } from '@nestjs/graphql';
import { DecisionMakingModel } from '../../proposals/proposals.constants';

@InputType()
export class UpdateServerConfigInput {
  @Field({ nullable: true })
  about?: string;

  @Field({ nullable: true })
  canaryStatement?: string;

  @Field({ nullable: true })
  showCanaryStatement?: boolean;

  @Field({ nullable: true })
  securityTxt?: string;

  @Field({ nullable: true })
  serverQuestionsPrompt?: string;

  @Field(() => DecisionMakingModel, { nullable: true })
  decisionMakingModel?: DecisionMakingModel;

  @Field(() => Int, { nullable: true })
  standAsidesLimit?: number;

  @Field(() => Int, { nullable: true })
  reservationsLimit?: number;

  @Field(() => Int, { nullable: true })
  ratificationThreshold?: number;

  @Field(() => Int, { nullable: true })
  verificationThreshold?: number;

  @Field(() => Int, { nullable: true })
  votingTimeLimit?: number;
}
