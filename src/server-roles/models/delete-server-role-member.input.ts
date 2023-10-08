import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class DeleteServerRoleMemberInput {
  @Field(() => Int)
  serverRoleId: number;

  @Field(() => Int)
  userId: number;
}
