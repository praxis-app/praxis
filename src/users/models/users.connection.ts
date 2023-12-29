import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class UsersConnection {
  @Field(() => [User])
  nodes: User[];

  @Field(() => Int)
  totalCount: number;
}
