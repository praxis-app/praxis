import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from '../../comments/models/comment.model';
import { Post } from '../../posts/models/post.model';
import { Answer } from '../../questions/models/answer.model';
import { Like } from './like.model';

@ObjectType()
export class CreateLikePayload {
  @Field()
  like: Like;

  @Field({ nullable: true })
  post?: Post;

  @Field({ nullable: true })
  comment?: Comment;

  @Field({ nullable: true })
  answer?: Answer;
}
