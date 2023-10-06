import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from './comment.model';

@ObjectType()
export class UpdateCommentPayload {
  @Field()
  comment: Comment;
}
