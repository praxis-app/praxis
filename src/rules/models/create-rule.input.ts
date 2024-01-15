import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRuleInput {
  @Field(() => Int, { nullable: true })
  groupId?: number;

  @Field()
  title: string;

  @Field()
  description: string;
}
