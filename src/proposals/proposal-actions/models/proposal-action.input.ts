import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { ProposalActionType } from '../../proposals.constants';
import { ProposalActionEventInput } from './proposal-action-event.input';
import { ProposalActionGroupConfigInput } from './proposal-action-group-config.input';
import { ProposalActionRoleInput } from './proposal-action-role-input';

@InputType()
export class ProposalActionInput {
  @Field(() => ProposalActionType)
  actionType: ProposalActionType;

  @Field({ nullable: true })
  event?: ProposalActionEventInput;

  @Field({ nullable: true })
  role?: ProposalActionRoleInput;

  @Field({ nullable: true })
  groupSettings?: ProposalActionGroupConfigInput;

  @Field({ nullable: true })
  groupName?: string;

  @Field({ nullable: true })
  groupDescription?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  groupCoverPhoto?: Promise<FileUpload>;
}
