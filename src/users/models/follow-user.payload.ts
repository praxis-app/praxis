import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class FollowUserPayload {
  @Field()
  followedUser: User;

  @Field()
  follower: User;
}
