import { Field, ObjectType } from '@nestjs/graphql';
import { Rule } from './rule.model';

@ObjectType()
export class UpdateRulePayload {
  @Field()
  rule: Rule;
}
