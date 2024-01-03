import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from './event.model';

@ObjectType()
export class UpdateEventAttendeePayload {
  @Field()
  event: Event;
}
