import { Field, ObjectType } from '@nestjs/graphql';
import { ServerQuestion } from './question.model';

@ObjectType()
export class UpdateQuestionPayload {
  @Field()
  question: ServerQuestion;
}
