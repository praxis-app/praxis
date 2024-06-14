import { Field, InputType, Int } from '@nestjs/graphql';

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
}
