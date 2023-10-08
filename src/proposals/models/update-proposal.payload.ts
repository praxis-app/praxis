import { Field, ObjectType } from '@nestjs/graphql';
import { Proposal } from './proposal.model';

@ObjectType()
export class UpdateProposalPayload {
  @Field()
  proposal: Proposal;
}
