import { Field, InputType, Int } from '@nestjs/graphql';
import { DecisionMakingModel } from '../../proposals/proposals.constants';

@InputType()
export class UpdateGroupConfigInput {
  @Field(() => Int)
  groupId: number;

  @Field({ nullable: true })
  adminModel?: string;

  @Field(() => DecisionMakingModel, { nullable: true })
  decisionMakingModel?: DecisionMakingModel;

  @Field(() => Int, { nullable: true })
  standAsidesLimit?: number;

  @Field(() => Int, { nullable: true })
  reservationsLimit?: number;

  @Field(() => Int, { nullable: true })
  ratificationThreshold?: number;

  @Field(() => Int, { nullable: true })
  votingTimeLimit?: number;

  @Field({ nullable: true })
  privacy?: string;
}
