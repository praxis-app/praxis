import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class CreatePostPayload {
  @Field()
  post: Post;
}
