import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ProposalActionRoleMemberInput {
  @Field(() => Int)
  userId: number;

  @Field()
  changeType: string;
}
