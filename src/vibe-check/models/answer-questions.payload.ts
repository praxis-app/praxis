import { Field, ObjectType } from '@nestjs/graphql';
import { QuestionnaireTicket } from './questionnaire-ticket.model';

@ObjectType()
export class AnswerQuestionsPayload {
  @Field()
  questionnaireTicket: QuestionnaireTicket;
}
