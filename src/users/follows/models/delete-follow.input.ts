import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class DeleteFollowInput {
  @Field(() => Int)
  userId: number;
}
