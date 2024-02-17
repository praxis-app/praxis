import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from '../../comments/models/comment.model';
import { Post } from '../../posts/models/post.model';
import { QuestionnaireTicketQuestion } from '../../questions/models/questionnaire-ticket-question.model';
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
  question?: QuestionnaireTicketQuestion;
}
