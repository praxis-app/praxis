import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class DeleteGroupRoleMemberInput {
  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  userId: number;
}
