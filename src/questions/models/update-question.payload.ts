import { Field, ObjectType } from '@nestjs/graphql';
import { Question } from './question.model';

@ObjectType()
export class UpdateQuestionPayload {
  @Field()
  question: Question;
}
