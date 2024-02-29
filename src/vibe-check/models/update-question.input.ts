import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateQuestionInput {
  @Field(() => Int)
  id: number;

  @Field()
  text: string;
}
