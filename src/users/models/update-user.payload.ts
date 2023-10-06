import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class UpdateUserPayload {
  @Field()
  user: User;
}
