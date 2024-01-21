import { Field, ObjectType } from '@nestjs/graphql';
import { Question } from './question.model';

@ObjectType()
export class CreateQuestionPayload {
  @Field()
  question: Question;
}
