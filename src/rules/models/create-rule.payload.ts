import { Field, ObjectType } from '@nestjs/graphql';
import { Rule } from './rule.model';

@ObjectType()
export class CreateRulePayload {
  @Field()
  rule: Rule;
}
