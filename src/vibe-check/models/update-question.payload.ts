import { Field, ObjectType } from '@nestjs/graphql';
import { ServerQuestion } from './server-question.model';

@ObjectType()
export class UpdateQuestionPayload {
  @Field()
  question: ServerQuestion;
}
