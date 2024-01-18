import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
class UpdateRulePriorityInput {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  priority: number;
}

@InputType()
export class UpdateRulesPriorityInput {
  @Field(() => [UpdateRulePriorityInput])
  rules: UpdateRulePriorityInput[];
}
