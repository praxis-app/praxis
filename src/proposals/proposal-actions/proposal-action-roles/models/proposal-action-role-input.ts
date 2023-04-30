import { Field, InputType, Int } from "@nestjs/graphql";
import { PermissionInput } from "../../../../roles/permissions/models/permission.input";
import { ProposalActionRoleMemberInput } from "./proposal-action-role-member.input";

@InputType()
export class ProposalActionRoleInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => [ProposalActionRoleMemberInput], { nullable: true })
  members?: ProposalActionRoleMemberInput[];

  @Field(() => [PermissionInput], { nullable: true })
  permissions?: PermissionInput[];
}
