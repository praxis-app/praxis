import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateEventAttendeeInput {
  @Field(() => Int)
  eventId: number;

  @Field()
  status: string;
}
