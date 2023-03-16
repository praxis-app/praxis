import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class DeleteLikeInput {
  @Field(() => Int, { nullable: true })
  postId: number;
}
