import { Field, InputType, Int } from "@nestjs/graphql";
import { PermissionInput } from "../../../roles/permissions/models/permission.input";

@InputType()
export class ProposalActionRoleInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => [Int], { nullable: true })
  selectedUserIds?: number[];

  @Field(() => [PermissionInput], { nullable: true })
  permissions?: PermissionInput[];
}
