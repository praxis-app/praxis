import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GroupsInput {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Boolean, { nullable: true })
  joinedGroups?: boolean;
}
