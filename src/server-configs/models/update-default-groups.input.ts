import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateDefaultGroupInput {
  @Field(() => Int)
  groupId: number;

  @Field()
  isDefault: boolean;
}

@InputType()
export class UpdateDefaultGroupsInput {
  @Field(() => [UpdateDefaultGroupInput])
  groups: UpdateDefaultGroupInput[];
}
