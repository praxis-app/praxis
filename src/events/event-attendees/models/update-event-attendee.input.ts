import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class UpdateEventAttendeeInput {
  @Field(() => Int)
  id: number;

  @Field()
  status: string;
}
