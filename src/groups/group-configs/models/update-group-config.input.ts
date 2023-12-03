import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateGroupConfigInput {
  @Field(() => Int)
  groupId: number;

  @Field({ nullable: true })
  decisionMakingModel?: string;

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
