import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class DeleteServerRoleMemberInput {
  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  userId: number;
}
