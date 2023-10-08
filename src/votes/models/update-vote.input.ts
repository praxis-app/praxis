import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateVoteInput {
  @Field(() => Int)
  id: number;

  @Field()
  voteType: string;
}
