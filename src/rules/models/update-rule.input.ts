import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateRuleInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => Int, { nullable: true })
  priority: number;
}
