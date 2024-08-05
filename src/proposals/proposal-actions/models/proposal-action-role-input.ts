import { Field, InputType, Int } from '@nestjs/graphql';
import { ProposalActionPermissionInput } from './proposal-action-permission.input';
import { ProposalActionRoleMemberInput } from './proposal-action-role-member.input';

@InputType()
export class ProposalActionRoleInput {
  @Field(() => Int, { nullable: true })
  roleToUpdateId: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => [ProposalActionRoleMemberInput], { nullable: true })
  members?: ProposalActionRoleMemberInput[];

  @Field(() => ProposalActionPermissionInput, { nullable: true })
  permissions?: ProposalActionPermissionInput;
}
