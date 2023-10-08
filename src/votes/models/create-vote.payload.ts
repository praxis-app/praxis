import { Field, ObjectType } from '@nestjs/graphql';
import { Vote } from './vote.model';

@ObjectType()
export class CreateVotePayload {
  @Field()
  vote: Vote;
}
