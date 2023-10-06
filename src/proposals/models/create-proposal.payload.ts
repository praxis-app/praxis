import { Field, ObjectType } from '@nestjs/graphql';
import { Proposal } from './proposal.model';

@ObjectType()
export class CreateProposalPayload {
  @Field()
  proposal: Proposal;
}
