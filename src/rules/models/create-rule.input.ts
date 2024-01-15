import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRuleInput {
  @Field(() => Int, { nullable: true })
  groupId: number;

  @Field()
  text: string;

  @Field(() => Int, { nullable: true })
  priority: number;
}
