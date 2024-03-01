import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class QuestionnaireTicketsInput {
  @Field()
  status: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}
