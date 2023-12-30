import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class PostsConnection {
  @Field(() => [Post])
  nodes: Post[];

  @Field(() => Int)
  totalCount: number;
}
