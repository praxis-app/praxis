import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
class UpdateQuestionPriorityInput {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  priority: number;
}

@InputType()
export class UpdateQuestionsPriorityInput {
  @Field(() => [UpdateQuestionPriorityInput])
  questions: UpdateQuestionPriorityInput[];
}
