import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateVoteInput {
  @Field(() => Int, { nullable: true })
  proposalId?: number;

  @Field()
  voteType: string;
}
