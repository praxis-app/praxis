import { Field, ObjectType } from '@nestjs/graphql';
import { Rule } from './rule.model';

@ObjectType()
export class UpdateRulesPriorityPayload {
  @Field(() => [Rule])
  rules: Rule[];
}
