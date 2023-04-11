import { Field, InputType, Int } from "@nestjs/graphql";
import { ProposedPermissionInput } from "./proposed-permission.input";

@InputType()
export class ProposedRoleInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => [Int], { nullable: true })
  selectedUserIds?: number[];

  @Field(() => [ProposedPermissionInput], { nullable: true })
  permissions?: ProposedPermissionInput[];
}
