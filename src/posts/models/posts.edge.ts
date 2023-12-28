import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class PostsEdge {
  @Field()
  cursor: Date;

  @Field(() => Post)
  node: Post;
}
