import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateEventAttendeeInput {
  @Field(() => Int)
  eventId: number;

  @Field()
  status: string;
}
