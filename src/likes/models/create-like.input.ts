import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateLikeInput {
  // TODO: Add ID fields for comments and other models when added

  @Field(() => Int, { nullable: true })
  postId: number;
}
