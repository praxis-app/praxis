import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LikesInput {
  @Field(() => Int, { nullable: true })
  postId?: number;

  @Field(() => Int, { nullable: true })
  commentId?: number;

  @Field(() => Int, { nullable: true })
  questionId?: number;
}
