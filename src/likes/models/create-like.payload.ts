import { Field, ObjectType } from '@nestjs/graphql';
import { Like } from './like.model';

@ObjectType()
export class CreateLikePayload {
  @Field()
  like: Like;
}
