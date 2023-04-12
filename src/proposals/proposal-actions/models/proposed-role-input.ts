import { Field, InputType, Int } from "@nestjs/graphql";
import { ProposalActionPermissionInput } from "./proposeal-action-permission.input";

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

  @Field(() => [ProposalActionPermissionInput], { nullable: true })
  permissions?: ProposalActionPermissionInput[];
}
