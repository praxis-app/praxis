import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
class AnswerInput {
  @Field(() => Int)
  questionId: number;

  @Field()
  text: string;
}

@InputType()
export class AnswerQuestionsInput {
  @Field(() => Int)
  questionnaireTicketId: number;

  @Field(() => [AnswerInput])
  answers: AnswerInput[];

  @Field()
  isSubmitting: boolean;
}
