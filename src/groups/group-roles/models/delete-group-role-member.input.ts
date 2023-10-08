import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class DeleteGroupRoleMemberInput {
  @Field(() => Int)
  groupRoleId: number;

  @Field(() => Int)
  userId: number;
}
