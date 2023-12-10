import { Field, ObjectType } from '@nestjs/graphql';
import { Proposal } from './proposal.model';

@ObjectType()
export class SynchronizeProposalPayload {
  @Field()
  proposal: Proposal;
}
