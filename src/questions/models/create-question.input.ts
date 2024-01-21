import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateQuestionInput {
  @Field(() => Int, { nullable: true })
  groupId?: number;

  @Field()
  text: string;
}
