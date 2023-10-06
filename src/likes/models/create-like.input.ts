// TODO: Add ID fields for comments and other models when added

import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateLikeInput {
  @Field(() => Int, { nullable: true })
  postId: number;
}
