import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateRuleInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  text: string;

  @Field(() => Int, { nullable: true })
  priority: number;
}
