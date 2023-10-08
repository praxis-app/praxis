import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateGroupRoleInput {
  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int)
  groupId: number;
}
