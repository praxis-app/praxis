import { Field, ObjectType } from '@nestjs/graphql';
import { Vote } from './vote.model';

@ObjectType()
export class UpdateVotePayload {
  @Field()
  vote: Vote;
}
