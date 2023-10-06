import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { ProposalActionInput } from '../proposal-actions/models/proposal-action.input';

@InputType()
export class CreateProposalInput {
  @Field(() => Int, { nullable: true })
  groupId: number;

  @Field({ nullable: true })
  body?: string;

  @Field(() => ProposalActionInput)
  action: ProposalActionInput;

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];
}
