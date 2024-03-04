import { Field, ObjectType } from '@nestjs/graphql';
import { ServerQuestion } from './server-question.model';

@ObjectType()
export class CreateQuestionPayload {
  @Field()
  question: ServerQuestion;
}
